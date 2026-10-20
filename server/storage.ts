import { 
  users, 
  teachings, 
  courses, 
  lessons, 
  userProgress, 
  voiceChannels, 
  voiceParticipants, 
  messages, 
  prayerRequests,
  certificates,
  siteSettings,
  projects,
  type User, 
  type InsertUser,
  type Teaching,
  type InsertTeaching,
  type Course,
  type InsertCourse,
  type Lesson,
  type InsertLesson,
  type Message,
  type InsertMessage,
  type PrayerRequest,
  type InsertPrayerRequest,
  type VoiceChannel,
  type InsertVoiceChannel,
  type Certificate,
  type InsertCertificate,
  type SiteSettings,
  type InsertSiteSettings,
  type Project,
  type InsertProject,
  type UpdateUserProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<User>;
  getFellowshipMembers(): Promise<any[]>;
  
  // Teaching operations
  getTeachings(): Promise<Teaching[]>;
  getTeaching(id: string): Promise<Teaching | undefined>;
  createTeaching(teaching: InsertTeaching): Promise<Teaching>;
  incrementTeachingViews(id: string): Promise<void>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  getUserProgress(userId: string, courseId: string): Promise<any[]>;
  updateUserProgress(userId: string, courseId: string, lessonId: string, watchTime: number): Promise<void>;
  markLessonComplete(userId: string, courseId: string, lessonId: string): Promise<void>;
  
  // Lesson operations
  getCourseLessons(courseId: string): Promise<Lesson[]>;
  getLesson(id: string): Promise<Lesson | undefined>;
  
  // Voice channel operations
  getActiveVoiceChannels(): Promise<VoiceChannel[]>;
  getVoiceChannel(id: string): Promise<VoiceChannel | undefined>;
  joinVoiceChannel(channelId: string, userId: string): Promise<void>;
  leaveVoiceChannel(channelId: string, userId: string): Promise<void>;
  getChannelParticipants(channelId: string): Promise<any[]>;
  toggleSelfMute(channelId: string, userId: string, isMuted: boolean): Promise<void>;
  moderatorMuteUser(channelId: string, targetUserId: string, isMuted: boolean): Promise<void>;
  
  // Message operations
  getMessages(channelType: string, channelId?: string): Promise<any[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Prayer request operations
  getPrayerRequests(): Promise<any[]>;
  createPrayerRequest(prayerRequest: InsertPrayerRequest): Promise<PrayerRequest>;
  incrementPrayerCount(id: string): Promise<void>;
  
  // Certificate operations
  getUserCertificates(userId: string): Promise<Certificate[]>;
  getCertificate(userId: string, courseId: string): Promise<Certificate | undefined>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  checkCourseCompletion(userId: string, courseId: string): Promise<boolean>;

  // Admin operations
  // User management
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Teaching management (admin)
  getAllTeachings(): Promise<Teaching[]>;
  updateTeaching(id: string, updates: Partial<InsertTeaching>): Promise<Teaching>;
  deleteTeaching(id: string): Promise<void>;
  
  // Course management (admin)
  getAllCourses(): Promise<Course[]>;
  updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  
  // Lesson management (admin)
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, updates: Partial<InsertLesson>): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;
  
  // Voice channel management (admin)
  getAllVoiceChannels(): Promise<VoiceChannel[]>;
  createVoiceChannel(channel: InsertVoiceChannel): Promise<VoiceChannel>;
  updateVoiceChannel(id: string, updates: Partial<InsertVoiceChannel>): Promise<VoiceChannel>;
  deleteVoiceChannel(id: string): Promise<void>;
  
  // Prayer request management (admin)
  getAllPrayerRequests(): Promise<any[]>;
  updatePrayerRequest(id: string, updates: Partial<InsertPrayerRequest>): Promise<PrayerRequest>;
  deletePrayerRequest(id: string): Promise<void>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  
  // Project management (admin)
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(updates: Partial<InsertSiteSettings>): Promise<SiteSettings>;
  initializeSiteSettings(): Promise<SiteSettings>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getFellowshipMembers(): Promise<any[]> {
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(users.firstName, users.lastName);
    
    // Apply privacy settings to each user
    return allUsers.map(user => {
      const privacy = user.privacySettings as any || {
        showRealName: true,
        showEmail: false,
        showInterests: true,
        showMinistryPreferences: true,
        showLearningGoals: true,
        showTeachingOfferings: true
      };
      
      return {
        id: user.id,
        username: user.username,
        displayName: privacy.showRealName 
          ? `${user.firstName} ${user.lastName}` 
          : (user.nickname || user.username),
        firstName: privacy.showRealName ? user.firstName : null,
        lastName: privacy.showRealName ? user.lastName : null,
        nickname: user.nickname,
        email: privacy.showEmail ? user.email : null,
        interests: privacy.showInterests ? user.interests : null,
        ministryPreferences: privacy.showMinistryPreferences ? user.ministryPreferences : null,
        wantToLearn: privacy.showLearningGoals ? user.wantToLearn : null,
        wantToTeach: privacy.showTeachingOfferings ? user.wantToTeach : null,
        privacySettings: privacy,
      };
    });
  }

  async getTeachings(): Promise<Teaching[]> {
    return await db
      .select()
      .from(teachings)
      .where(eq(teachings.isPublic, true))
      .orderBy(desc(teachings.createdAt));
  }

  async getTeaching(id: string): Promise<Teaching | undefined> {
    const [teaching] = await db.select().from(teachings).where(eq(teachings.id, id));
    return teaching || undefined;
  }

  async createTeaching(insertTeaching: InsertTeaching): Promise<Teaching> {
    const [teaching] = await db
      .insert(teachings)
      .values(insertTeaching)
      .returning();
    return teaching;
  }

  async incrementTeachingViews(id: string): Promise<void> {
    const [current] = await db.select({ views: teachings.views }).from(teachings).where(eq(teachings.id, id));
    const currentViews = current?.views || 0;
    await db
      .update(teachings)
      .set({ views: currentViews + 1 })
      .where(eq(teachings.id, id));
  }

  async getCourses(): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(eq(courses.isPublic, true))
      .orderBy(desc(courses.createdAt));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return course;
  }

  async getUserProgress(userId: string, courseId: string): Promise<any[]> {
    return await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.courseId, courseId)));
  }

  async getCourseLessons(courseId: string): Promise<Lesson[]> {
    return await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(lessons.order);
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson || undefined;
  }

  async updateUserProgress(userId: string, courseId: string, lessonId: string, watchTime: number): Promise<void> {
    await db
      .insert(userProgress)
      .values({
        userId,
        courseId,
        lessonId,
        watchTime,
        completed: false,
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.courseId, userProgress.lessonId],
        set: {
          watchTime,
          updatedAt: new Date(),
        },
      });
  }

  async markLessonComplete(userId: string, courseId: string, lessonId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Mark the lesson as complete
      await tx
        .insert(userProgress)
        .values({
          userId,
          courseId,
          lessonId,
          completed: true,
          watchTime: 0,
        })
        .onConflictDoUpdate({
          target: [userProgress.userId, userProgress.courseId, userProgress.lessonId],
          set: {
            completed: true,
            updatedAt: new Date(),
          },
        });

      // Check if course is now complete and issue certificate if needed
      const isCompleted = await this.checkCourseCompletionWithTx(tx, userId, courseId);
      if (isCompleted) {
        const existingCertificate = await tx
          .select()
          .from(certificates)
          .where(and(eq(certificates.userId, userId), eq(certificates.courseId, courseId)));
        
        if (existingCertificate.length === 0) {
          await tx
            .insert(certificates)
            .values({
              userId,
              courseId,
              certificateUrl: null,
            })
            .onConflictDoNothing({ target: [certificates.userId, certificates.courseId] });
        }
      }
    });
  }

  async getActiveVoiceChannels(): Promise<VoiceChannel[]> {
    return await db
      .select()
      .from(voiceChannels)
      .where(eq(voiceChannels.isActive, true))
      .orderBy(desc(voiceChannels.createdAt));
  }

  async getVoiceChannel(id: string): Promise<VoiceChannel | undefined> {
    const [channel] = await db.select().from(voiceChannels).where(eq(voiceChannels.id, id));
    return channel || undefined;
  }

  async joinVoiceChannel(channelId: string, userId: string): Promise<void> {
    // A user can only be in one voice channel at a time
    await db.delete(voiceParticipants).where(eq(voiceParticipants.userId, userId));
    await db.insert(voiceParticipants).values({ channelId, userId });
  }

  async leaveVoiceChannel(channelId: string, userId: string): Promise<void> {
    await db
      .delete(voiceParticipants)
      .where(and(eq(voiceParticipants.channelId, channelId), eq(voiceParticipants.userId, userId)));
  }

  async getChannelParticipants(channelId: string): Promise<any[]> {
    const participants = await db
      .select({
        id: voiceParticipants.id,
        userId: voiceParticipants.userId,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        isMuted: voiceParticipants.isMuted,
        isMutedByModerator: voiceParticipants.isMutedByModerator,
        joinedAt: voiceParticipants.joinedAt,
      })
      .from(voiceParticipants)
      .innerJoin(users, eq(voiceParticipants.userId, users.id))
      .where(eq(voiceParticipants.channelId, channelId));
    
    // Map to camelCase for frontend
    return participants.map(p => ({
      id: p.id,
      userId: p.userId,
      username: p.username,
      firstName: p.firstName,
      lastName: p.lastName,
      isMuted: p.isMuted || false,
      isMutedByModerator: p.isMutedByModerator || false,
      joinedAt: p.joinedAt,
    }));
  }

  async toggleSelfMute(channelId: string, userId: string, isMuted: boolean): Promise<void> {
    await db
      .update(voiceParticipants)
      .set({ isMuted })
      .where(and(eq(voiceParticipants.channelId, channelId), eq(voiceParticipants.userId, userId)));
  }

  async moderatorMuteUser(channelId: string, targetUserId: string, isMuted: boolean): Promise<void> {
    await db
      .update(voiceParticipants)
      .set({ isMutedByModerator: isMuted })
      .where(and(eq(voiceParticipants.channelId, channelId), eq(voiceParticipants.userId, targetUserId)));
  }

  async getMessages(channelType: string, channelId?: string): Promise<any[]> {
    const query = db
      .select({
        id: messages.id,
        content: messages.content,
        senderId: messages.senderId,
        senderUsername: users.username,
        senderFirstName: users.firstName,
        senderLastName: users.lastName,
        channelType: messages.channelType,
        channelId: messages.channelId,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.channelType, channelType))
      .orderBy(desc(messages.createdAt))
      .limit(50);

    if (channelId) {
      return await db
        .select({
          id: messages.id,
          content: messages.content,
          senderId: messages.senderId,
          senderUsername: users.username,
          senderFirstName: users.firstName,
          senderLastName: users.lastName,
          channelType: messages.channelType,
          channelId: messages.channelId,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(and(eq(messages.channelType, channelType), eq(messages.channelId, channelId)))
        .orderBy(desc(messages.createdAt))
        .limit(50);
    }

    return await query;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getPrayerRequests(): Promise<any[]> {
    return await db
      .select({
        id: prayerRequests.id,
        title: prayerRequests.title,
        description: prayerRequests.description,
        requesterId: prayerRequests.requesterId,
        requesterUsername: users.username,
        requesterFirstName: users.firstName,
        requesterLastName: users.lastName,
        isAnonymous: prayerRequests.isAnonymous,
        isAnswered: prayerRequests.isAnswered,
        prayerCount: prayerRequests.prayerCount,
        createdAt: prayerRequests.createdAt,
      })
      .from(prayerRequests)
      .innerJoin(users, eq(prayerRequests.requesterId, users.id))
      .orderBy(desc(prayerRequests.createdAt));
  }

  async createPrayerRequest(insertPrayerRequest: InsertPrayerRequest): Promise<PrayerRequest> {
    const [prayerRequest] = await db
      .insert(prayerRequests)
      .values(insertPrayerRequest)
      .returning();
    return prayerRequest;
  }

  async incrementPrayerCount(id: string): Promise<void> {
    const [current] = await db.select({ prayerCount: prayerRequests.prayerCount }).from(prayerRequests).where(eq(prayerRequests.id, id));
    const currentCount = current?.prayerCount || 0;
    await db
      .update(prayerRequests)
      .set({ prayerCount: currentCount + 1 })
      .where(eq(prayerRequests.id, id));
  }

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    return await db
      .select()
      .from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(desc(certificates.completedAt));
  }

  async getCertificate(userId: string, courseId: string): Promise<Certificate | undefined> {
    const [certificate] = await db
      .select()
      .from(certificates)
      .where(and(eq(certificates.userId, userId), eq(certificates.courseId, courseId)));
    return certificate || undefined;
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const [certificate] = await db
      .insert(certificates)
      .values(insertCertificate)
      .onConflictDoNothing({ target: [certificates.userId, certificates.courseId] })
      .returning();
    return certificate;
  }

  async checkCourseCompletion(userId: string, courseId: string): Promise<boolean> {
    // Get all lessons for the course
    const courseLessons = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.courseId, courseId));
    
    if (courseLessons.length === 0) return false;

    // Get completed lessons for this user and course
    const completedLessons = await db
      .select({ lessonId: userProgress.lessonId })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.courseId, courseId),
          eq(userProgress.completed, true)
        )
      );

    // Check if all lessons are completed
    return completedLessons.length === courseLessons.length;
  }

  async checkCourseCompletionWithTx(tx: any, userId: string, courseId: string): Promise<boolean> {
    // Get all lessons for the course
    const courseLessons = await tx
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.courseId, courseId));
    
    if (courseLessons.length === 0) return false;

    // Get completed lessons for this user and course
    const completedLessons = await tx
      .select({ lessonId: userProgress.lessonId })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.courseId, courseId),
          eq(userProgress.completed, true)
        )
      );

    // Check if all lessons are completed
    return completedLessons.length === courseLessons.length;
  }

  // Admin operations implementation
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Delete dependent records first
      await tx.delete(voiceParticipants).where(eq(voiceParticipants.userId, id));
      await tx.delete(messages).where(eq(messages.senderId, id));
      await tx.delete(prayerRequests).where(eq(prayerRequests.requesterId, id));
      await tx.delete(userProgress).where(eq(userProgress.userId, id));
      await tx.delete(certificates).where(eq(certificates.userId, id));
      // Finally delete the user
      await tx.delete(users).where(eq(users.id, id));
    });
  }

  async getAllTeachings(): Promise<Teaching[]> {
    return await db
      .select()
      .from(teachings)
      .orderBy(desc(teachings.createdAt));
  }

  async updateTeaching(id: string, updates: Partial<InsertTeaching>): Promise<Teaching> {
    const [teaching] = await db
      .update(teachings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(teachings.id, id))
      .returning();
    return teaching;
  }

  async deleteTeaching(id: string): Promise<void> {
    await db.delete(teachings).where(eq(teachings.id, id));
  }

  async getAllCourses(): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .orderBy(desc(courses.createdAt));
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course> {
    const [course] = await db
      .update(courses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Delete dependent records first
      await tx.delete(certificates).where(eq(certificates.courseId, id));
      await tx.delete(userProgress).where(eq(userProgress.courseId, id));
      await tx.delete(lessons).where(eq(lessons.courseId, id));
      // Finally delete the course
      await tx.delete(courses).where(eq(courses.id, id));
    });
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    return await db.transaction(async (tx) => {
      const [lesson] = await tx
        .insert(lessons)
        .values(insertLesson)
        .returning();
      
      // Update course totalLessons count
      const lessonCount = await tx
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(lessons)
        .where(eq(lessons.courseId, insertLesson.courseId));
      
      await tx
        .update(courses)
        .set({ totalLessons: lessonCount[0].count })
        .where(eq(courses.id, insertLesson.courseId));
      
      return lesson;
    });
  }

  async updateLesson(id: string, updates: Partial<InsertLesson>): Promise<Lesson> {
    const [lesson] = await db
      .update(lessons)
      .set(updates)
      .where(eq(lessons.id, id))
      .returning();
    return lesson;
  }

  async deleteLesson(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Get lesson info before deleting
      const [lesson] = await tx.select({ courseId: lessons.courseId }).from(lessons).where(eq(lessons.id, id));
      if (!lesson) return;
      
      // Delete dependent records first
      await tx.delete(userProgress).where(eq(userProgress.lessonId, id));
      
      // Delete the lesson
      await tx.delete(lessons).where(eq(lessons.id, id));
      
      // Update course totalLessons count
      const lessonCount = await tx
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(lessons)
        .where(eq(lessons.courseId, lesson.courseId));
      
      await tx
        .update(courses)
        .set({ totalLessons: lessonCount[0].count })
        .where(eq(courses.id, lesson.courseId));
    });
  }

  async getAllVoiceChannels(): Promise<VoiceChannel[]> {
    return await db
      .select()
      .from(voiceChannels)
      .orderBy(desc(voiceChannels.createdAt));
  }

  async createVoiceChannel(insertVoiceChannel: InsertVoiceChannel): Promise<VoiceChannel> {
    const [voiceChannel] = await db
      .insert(voiceChannels)
      .values(insertVoiceChannel)
      .returning();
    return voiceChannel;
  }

  async updateVoiceChannel(id: string, updates: Partial<InsertVoiceChannel>): Promise<VoiceChannel> {
    const [voiceChannel] = await db
      .update(voiceChannels)
      .set(updates)
      .where(eq(voiceChannels.id, id))
      .returning();
    return voiceChannel;
  }

  async deleteVoiceChannel(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Delete dependent records first
      await tx.delete(voiceParticipants).where(eq(voiceParticipants.channelId, id));
      // Finally delete the voice channel
      await tx.delete(voiceChannels).where(eq(voiceChannels.id, id));
    });
  }

  async getAllPrayerRequests(): Promise<any[]> {
    return await db
      .select({
        id: prayerRequests.id,
        title: prayerRequests.title,
        description: prayerRequests.description,
        requesterId: prayerRequests.requesterId,
        requesterUsername: users.username,
        requesterFirstName: users.firstName,
        requesterLastName: users.lastName,
        isAnonymous: prayerRequests.isAnonymous,
        isAnswered: prayerRequests.isAnswered,
        prayerCount: prayerRequests.prayerCount,
        createdAt: prayerRequests.createdAt,
        updatedAt: prayerRequests.updatedAt,
      })
      .from(prayerRequests)
      .innerJoin(users, eq(prayerRequests.requesterId, users.id))
      .orderBy(desc(prayerRequests.createdAt));
  }

  async updatePrayerRequest(id: string, updates: Partial<InsertPrayerRequest>): Promise<PrayerRequest> {
    const [prayerRequest] = await db
      .update(prayerRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(prayerRequests.id, id))
      .returning();
    return prayerRequest;
  }

  async deletePrayerRequest(id: string): Promise<void> {
    await db.delete(prayerRequests).where(eq(prayerRequests.id, id));
  }
  
  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.isPublic, true))
      .orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.isPublic, true)));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }
  
  // Site Settings operations
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    return settings || undefined;
  }
  
  async updateSiteSettings(updates: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    // Get existing settings
    const existing = await this.getSiteSettings();
    
    if (!existing) {
      // Initialize if doesn't exist
      return this.initializeSiteSettings();
    }
    
    // Update the existing settings
    const [updated] = await db
      .update(siteSettings)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(siteSettings.id, existing.id))
      .returning();
      
    return updated;
  }
  
  async initializeSiteSettings(): Promise<SiteSettings> {
    // Check if settings already exist
    const existing = await this.getSiteSettings();
    if (existing) {
      return existing;
    }
    
    // Create default settings
    const [settings] = await db
      .insert(siteSettings)
      .values({})  // Will use default values from schema
      .returning();
      
    return settings;
  }
}

export const storage = new DatabaseStorage();
