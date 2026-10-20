import fs from "fs";
import { ensureUploadsDir, resolvePublicObject, savePublicObject } from "./objectStorage";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { setupAuth, publicUser } from "./auth";
import { 
  insertUserSchema,
  insertTeachingSchema,
  insertCourseSchema,
  insertLessonSchema,
  insertVoiceChannelSchema,
  insertPrayerRequestSchema,
  insertProjectSchema
} from "@shared/schema";
import multer from "multer";

const scryptAsync = promisify(scrypt);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Public uploaded files (stored on local disk)
  ensureUploadsDir();
  app.get("/public-objects/:filePath(*)", (req, res) => {
    const full = resolvePublicObject(req.params.filePath);
    if (!full || !fs.existsSync(full)) {
      return res.status(404).json({ error: "File not found" });
    }
    res.sendFile(full, { maxAge: "1y" });
  });

  // Public API routes (accessible without authentication)
  
  // Get all public teachings
  app.get("/api/teachings", async (req, res) => {
    try {
      const teachings = await storage.getTeachings();
      res.json(teachings);
    } catch (error) {
      console.error("Error fetching teachings:", error);
      res.status(500).json({ message: "Failed to fetch teachings" });
    }
  });

  // Get specific teaching
  app.get("/api/teachings/:id", async (req, res) => {
    try {
      const teaching = await storage.getTeaching(req.params.id);
      if (!teaching || !teaching.isPublic) {
        return res.status(404).json({ message: "Teaching not found" });
      }
      
      // Increment view count
      await storage.incrementTeachingViews(req.params.id);
      res.json(teaching);
    } catch (error) {
      console.error("Error fetching teaching:", error);
      res.status(500).json({ message: "Failed to fetch teaching" });
    }
  });

  // Get all public courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get specific course
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course || !course.isPublic) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Get course lessons
  app.get("/api/courses/:id/lessons", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course || !course.isPublic) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const lessons = await storage.getCourseLessons(req.params.id);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching course lessons:", error);
      res.status(500).json({ message: "Failed to fetch course lessons" });
    }
  });

  // Get specific lesson
  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const lesson = await storage.getLesson(req.params.id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  // Get active voice channels (listening allowed for guests)
  app.get("/api/voice-channels", async (req, res) => {
    try {
      const channels = await storage.getActiveVoiceChannels();
      const channelsWithParticipants = await Promise.all(
        channels.map(async (channel) => {
          const participants = await storage.getChannelParticipants(channel.id);
          return {
            ...channel,
            participantCount: participants.length,
            participants: participants,
          };
        })
      );
      res.json(channelsWithParticipants);
    } catch (error) {
      console.error("Error fetching voice channels:", error);
      res.status(500).json({ message: "Failed to fetch voice channels" });
    }
  });

  // Protected API routes (require authentication)
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Get messages for a channel
  app.get("/api/messages/:channelType", requireAuth, async (req, res) => {
    try {
      const { channelType } = req.params;
      const { channelId } = req.query;
      const messages = await storage.getMessages(channelType, channelId as string);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post("/api/messages", requireAuth, async (req: any, res) => {
    try {
      const { content, channelType, channelId } = req.body;
      const senderId = req.user.id;

      const message = await storage.createMessage({
        content,
        senderId,
        channelType,
        channelId: channelId || null,
      });

      // Broadcast message via WebSocket
      const messageData = {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderUsername: req.user.username,
        senderFirstName: req.user.firstName,
        senderLastName: req.user.lastName,
        channelType: message.channelType,
        channelId: message.channelId,
        createdAt: message.createdAt,
      };

      broadcastMessage('message', messageData);
      res.status(201).json(messageData);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Join voice channel
  app.post("/api/voice-channels/:id/join", requireAuth, async (req: any, res) => {
    try {
      const channelId = req.params.id;
      const userId = req.user.id;

      await storage.joinVoiceChannel(channelId, userId);
      
      const participants = await storage.getChannelParticipants(channelId);
      broadcastMessage('voice-channel-update', { channelId, participants });
      
      res.json({ message: "Joined voice channel successfully" });
    } catch (error) {
      console.error("Error joining voice channel:", error);
      res.status(500).json({ message: "Failed to join voice channel" });
    }
  });

  // Leave voice channel
  app.post("/api/voice-channels/:id/leave", requireAuth, async (req: any, res) => {
    try {
      const channelId = req.params.id;
      const userId = req.user.id;

      await storage.leaveVoiceChannel(channelId, userId);
      
      const participants = await storage.getChannelParticipants(channelId);
      broadcastMessage('voice-channel-update', { channelId, participants });
      
      res.json({ message: "Left voice channel successfully" });
    } catch (error) {
      console.error("Error leaving voice channel:", error);
      res.status(500).json({ message: "Failed to leave voice channel" });
    }
  });

  // Toggle self mute
  app.post("/api/voice-channels/:id/toggle-mute", requireAuth, async (req: any, res) => {
    try {
      const channelId = req.params.id;
      const userId = req.user.id;
      const { isMuted } = req.body;

      await storage.toggleSelfMute(channelId, userId, isMuted);
      
      const participants = await storage.getChannelParticipants(channelId);
      broadcastMessage('voice-channel-update', { channelId, participants });
      
      res.json({ message: isMuted ? "Muted successfully" : "Unmuted successfully" });
    } catch (error) {
      console.error("Error toggling mute:", error);
      res.status(500).json({ message: "Failed to toggle mute" });
    }
  });

  // Moderator mute/unmute user
  app.post("/api/voice-channels/:id/moderator-mute", requireAuth, async (req: any, res) => {
    try {
      const channelId = req.params.id;
      const { targetUserId, isMuted } = req.body;

      // Get channel to verify moderator
      const channel = await storage.getVoiceChannel(channelId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      // Check if user is moderator or creator
      if (channel.moderatorId !== req.user?.id && channel.createdBy !== req.user?.id && !req.user?.isAdmin) {
        return res.status(403).json({ message: "Only channel moderators can mute others" });
      }

      await storage.moderatorMuteUser(channelId, targetUserId, isMuted);
      
      const participants = await storage.getChannelParticipants(channelId);
      broadcastMessage('voice-channel-update', { channelId, participants });
      
      res.json({ message: isMuted ? "User muted successfully" : "User unmuted successfully" });
    } catch (error) {
      console.error("Error moderator muting user:", error);
      res.status(500).json({ message: "Failed to mute/unmute user" });
    }
  });

  // Get prayer requests
  app.get("/api/prayer-requests", requireAuth, async (req, res) => {
    try {
      const prayerRequests = await storage.getPrayerRequests();
      res.json(prayerRequests);
    } catch (error) {
      console.error("Error fetching prayer requests:", error);
      res.status(500).json({ message: "Failed to fetch prayer requests" });
    }
  });

  // Create prayer request
  app.post("/api/prayer-requests", requireAuth, async (req: any, res) => {
    try {
      const { title, description, isAnonymous } = req.body;
      const requesterId = req.user.id;

      const prayerRequest = await storage.createPrayerRequest({
        title,
        description,
        requesterId,
        isAnonymous: isAnonymous || false,
      });

      res.status(201).json(prayerRequest);
    } catch (error) {
      console.error("Error creating prayer request:", error);
      res.status(500).json({ message: "Failed to create prayer request" });
    }
  });

  // Pray for request
  app.post("/api/prayer-requests/:id/pray", requireAuth, async (req, res) => {
    try {
      const requestId = req.params.id;
      await storage.incrementPrayerCount(requestId);
      res.json({ message: "Prayer added successfully" });
    } catch (error) {
      console.error("Error adding prayer:", error);
      res.status(500).json({ message: "Failed to add prayer" });
    }
  });

  // Get all public projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get specific project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Get user progress for a course
  app.get("/api/courses/:id/progress", requireAuth, async (req: any, res) => {
    try {
      const courseId = req.params.id;
      const userId = req.user.id;
      
      const progress = await storage.getUserProgress(userId, courseId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Update user progress (watch time)
  app.post("/api/progress/update", requireAuth, async (req: any, res) => {
    try {
      const { courseId, lessonId, watchTime } = req.body;
      const userId = req.user.id;
      
      await storage.updateUserProgress(userId, courseId, lessonId, watchTime);
      res.json({ message: "Progress updated successfully" });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Mark lesson as complete
  app.post("/api/progress/complete", requireAuth, async (req: any, res) => {
    try {
      const { courseId, lessonId } = req.body;
      const userId = req.user.id;
      
      await storage.markLessonComplete(userId, courseId, lessonId);
      res.json({ message: "Lesson marked as complete" });
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      res.status(500).json({ message: "Failed to mark lesson complete" });
    }
  });

  // Get user certificates
  app.get("/api/certificates", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  // Get certificate for specific course
  app.get("/api/certificates/:courseId", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const courseId = req.params.courseId;
      const certificate = await storage.getCertificate(userId, courseId);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      res.json(certificate);
    } catch (error) {
      console.error("Error fetching certificate:", error);
      res.status(500).json({ message: "Failed to fetch certificate" });
    }
  });

  // Update user profile
  app.put("/api/user/profile", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updates = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, updates);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get fellowship members
  app.get("/api/fellowship/members", requireAuth, async (req, res) => {
    try {
      const members = await storage.getFellowshipMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching fellowship members:", error);
      res.status(500).json({ message: "Failed to fetch fellowship members" });
    }
  });

  // ======= ADMIN ROUTES =======
  
  // File upload (admin) - saves to local disk
  app.post("/api/admin/upload", requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const file = req.file;
      const { publicUrl } = await savePublicObject(file.originalname, file.buffer);
      res.json({
        message: "File uploaded successfully",
        url: publicUrl,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // User Management
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(publicUser));
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { username, password, firstName, lastName, email, isAdmin } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;

      const user = await storage.createUser({
        username,
        password: hashedPassword,
        firstName: firstName || "",
        lastName: lastName || "",
        email: email || "",
        isAdmin: isAdmin || false,
      });

      res.status(201).json(publicUser(user));
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const validation = insertUserSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const user = await storage.updateUser(req.params.id, validation.data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(publicUser(user));
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.deleteUser(req.params.id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Teaching Management
  app.get("/api/admin/teachings", requireAdmin, async (req, res) => {
    try {
      const teachings = await storage.getAllTeachings();
      res.json(teachings);
    } catch (error) {
      console.error("Error fetching all teachings:", error);
      res.status(500).json({ message: "Failed to fetch teachings" });
    }
  });

  app.post("/api/admin/teachings", requireAdmin, async (req, res) => {
    try {
      const validation = insertTeachingSchema.safeParse(req.body);
      if (!validation.success) {
        console.error("Teaching validation errors:", JSON.stringify(validation.error.errors, null, 2));
        console.error("Request body:", JSON.stringify(req.body, null, 2));
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const teaching = await storage.createTeaching(validation.data);
      res.status(201).json(teaching);
    } catch (error) {
      console.error("Error creating teaching:", error);
      res.status(500).json({ message: "Failed to create teaching" });
    }
  });

  app.patch("/api/admin/teachings/:id", requireAdmin, async (req, res) => {
    try {
      const validation = insertTeachingSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const teaching = await storage.updateTeaching(req.params.id, validation.data);
      if (!teaching) {
        return res.status(404).json({ message: "Teaching not found" });
      }
      res.json(teaching);
    } catch (error) {
      console.error("Error updating teaching:", error);
      res.status(500).json({ message: "Failed to update teaching" });
    }
  });

  app.delete("/api/admin/teachings/:id", requireAdmin, async (req, res) => {
    try {
      const teaching = await storage.getTeaching(req.params.id);
      if (!teaching) {
        return res.status(404).json({ message: "Teaching not found" });
      }
      
      await storage.deleteTeaching(req.params.id);
      res.json({ message: "Teaching deleted successfully" });
    } catch (error) {
      console.error("Error deleting teaching:", error);
      res.status(500).json({ message: "Failed to delete teaching" });
    }
  });

  // Course Management
  app.get("/api/admin/courses", requireAdmin, async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching all courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.post("/api/admin/courses", requireAdmin, async (req, res) => {
    try {
      const validation = insertCourseSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const course = await storage.createCourse(validation.data);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.patch("/api/admin/courses/:id", requireAdmin, async (req, res) => {
    try {
      const validation = insertCourseSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const course = await storage.updateCourse(req.params.id, validation.data);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete("/api/admin/courses/:id", requireAdmin, async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      await storage.deleteCourse(req.params.id);
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Lesson Management
  app.post("/api/admin/lessons", requireAdmin, async (req, res) => {
    try {
      const validation = insertLessonSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const lesson = await storage.createLesson(validation.data);
      res.status(201).json(lesson);
    } catch (error) {
      console.error("Error creating lesson:", error);
      res.status(500).json({ message: "Failed to create lesson" });
    }
  });

  app.patch("/api/admin/lessons/:id", requireAdmin, async (req, res) => {
    try {
      const validation = insertLessonSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const lesson = await storage.updateLesson(req.params.id, validation.data);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      console.error("Error updating lesson:", error);
      res.status(500).json({ message: "Failed to update lesson" });
    }
  });

  app.delete("/api/admin/lessons/:id", requireAdmin, async (req, res) => {
    try {
      const lesson = await storage.getLesson(req.params.id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      await storage.deleteLesson(req.params.id);
      res.json({ message: "Lesson deleted successfully" });
    } catch (error) {
      console.error("Error deleting lesson:", error);
      res.status(500).json({ message: "Failed to delete lesson" });
    }
  });

  // Voice Channel Management
  app.get("/api/admin/voice-channels", requireAdmin, async (req, res) => {
    try {
      const channels = await storage.getAllVoiceChannels();
      res.json(channels);
    } catch (error) {
      console.error("Error fetching all voice channels:", error);
      res.status(500).json({ message: "Failed to fetch voice channels" });
    }
  });

  app.post("/api/admin/voice-channels", requireAdmin, async (req, res) => {
    try {
      const channelData = { ...req.body, createdBy: req.user.id };
      const validation = insertVoiceChannelSchema.safeParse(channelData);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const channel = await storage.createVoiceChannel(validation.data);
      res.status(201).json(channel);
    } catch (error) {
      console.error("Error creating voice channel:", error);
      res.status(500).json({ message: "Failed to create voice channel" });
    }
  });

  app.patch("/api/admin/voice-channels/:id", requireAdmin, async (req, res) => {
    try {
      const validation = insertVoiceChannelSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const channel = await storage.updateVoiceChannel(req.params.id, validation.data);
      if (!channel) {
        return res.status(404).json({ message: "Voice channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error updating voice channel:", error);
      res.status(500).json({ message: "Failed to update voice channel" });
    }
  });

  app.delete("/api/admin/voice-channels/:id", requireAdmin, async (req, res) => {
    try {
      const channel = await storage.getVoiceChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "Voice channel not found" });
      }
      
      await storage.deleteVoiceChannel(req.params.id);
      res.json({ message: "Voice channel deleted successfully" });
    } catch (error) {
      console.error("Error deleting voice channel:", error);
      res.status(500).json({ message: "Failed to delete voice channel" });
    }
  });

  // Prayer Request Management
  app.get("/api/admin/prayer-requests", requireAdmin, async (req, res) => {
    try {
      const prayerRequests = await storage.getAllPrayerRequests();
      res.json(prayerRequests);
    } catch (error) {
      console.error("Error fetching all prayer requests:", error);
      res.status(500).json({ message: "Failed to fetch prayer requests" });
    }
  });

  app.put("/api/admin/prayer-requests/:id", requireAdmin, async (req, res) => {
    try {
      const validation = insertPrayerRequestSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const prayerRequest = await storage.updatePrayerRequest(req.params.id, validation.data);
      if (!prayerRequest) {
        return res.status(404).json({ message: "Prayer request not found" });
      }
      res.json(prayerRequest);
    } catch (error) {
      console.error("Error updating prayer request:", error);
      res.status(500).json({ message: "Failed to update prayer request" });
    }
  });

  app.delete("/api/admin/prayer-requests/:id", requireAdmin, async (req, res) => {
    try {
      // Check existence first - get from the getAllPrayerRequests and find by id
      const prayerRequests = await storage.getAllPrayerRequests();
      const exists = prayerRequests.some(pr => pr.id === req.params.id);
      if (!exists) {
        return res.status(404).json({ message: "Prayer request not found" });
      }
      
      await storage.deletePrayerRequest(req.params.id);
      res.json({ message: "Prayer request deleted successfully" });
    } catch (error) {
      console.error("Error deleting prayer request:", error);
      res.status(500).json({ message: "Failed to delete prayer request" });
    }
  });

  // Admin Project Management
  app.post("/api/admin/projects", requireAdmin, async (req, res) => {
    try {
      const validation = insertProjectSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const project = await storage.createProject(validation.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/admin/projects/:id", requireAdmin, async (req, res) => {
    try {
      const validation = insertProjectSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const project = await storage.updateProject(req.params.id, validation.data);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/admin/projects/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Site Settings Management
  app.get("/api/settings", async (req, res) => {
    try {
      let settings = await storage.getSiteSettings();
      
      // Initialize default settings if they don't exist
      if (!settings) {
        settings = await storage.initializeSiteSettings();
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.put("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.updateSiteSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(500).json({ message: "Failed to update site settings" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const connectedClients = new Set<WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    connectedClients.add(ws);
    console.log('WebSocket client connected');

    ws.on('close', () => {
      connectedClients.delete(ws);
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connectedClients.delete(ws);
    });
  });

  // Broadcast function for real-time updates
  function broadcastMessage(type: string, data: any) {
    const message = JSON.stringify({ type, data });
    connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Make broadcastMessage available to route handlers
  (global as any).broadcastMessage = broadcastMessage;

  return httpServer;
}
