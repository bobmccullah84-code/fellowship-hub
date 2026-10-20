import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isAdmin: boolean("is_admin").default(false),
  
  // Fellowship profile fields
  nickname: text("nickname"),
  interests: text("interests").array(),
  ministryPreferences: text("ministry_preferences").array(),
  wantToLearn: text("want_to_learn").array(),
  wantToTeach: text("want_to_teach").array(),
  privacySettings: jsonb("privacy_settings").default({
    showRealName: true,
    showEmail: false,
    showInterests: true,
    showMinistryPreferences: true,
    showLearningGoals: true,
    showTeachingOfferings: true
  }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teachings = pgTable("teachings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  speaker: text("speaker").notNull(),
  contentType: text("content_type").default("video"), // video, audio, document, youtube, text
  videoUrl: text("video_url"),
  audioUrl: text("audio_url"),
  documentUrl: text("document_url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // in seconds
  views: integer("views").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  totalLessons: integer("total_lessons").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  description: text("description"),
  contentType: text("content_type").default("video"), // video, audio, document, youtube, text, mixed
  videoUrl: text("video_url"),
  audioUrl: text("audio_url"),
  documentUrl: text("document_url"),
  content: text("content"), // For text/mixed content types - can contain HTML
  order: integer("order").notNull(),
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  lessonId: varchar("lesson_id").references(() => lessons.id),
  completed: boolean("completed").default(false),
  watchTime: integer("watch_time").default(0), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Unique constraint on user_id, course_id, lesson_id combination
  userCourseLesson: unique().on(table.userId, table.courseId, table.lessonId),
}));

export const voiceChannels = pgTable("voice_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(false),
  maxParticipants: integer("max_participants").default(50),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  moderatorId: varchar("moderator_id").references(() => users.id), // Channel moderator who can mute others
  createdAt: timestamp("created_at").defaultNow(),
});

export const voiceParticipants = pgTable("voice_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").notNull().references(() => voiceChannels.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  isMuted: boolean("is_muted").default(false), // Self-muted by user
  isMutedByModerator: boolean("is_muted_by_moderator").default(false), // Muted by moderator
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  channelType: text("channel_type").notNull(), // 'general', 'prayer', 'study'
  channelId: varchar("channel_id"), // null for general chat
  createdAt: timestamp("created_at").defaultNow(),
});

export const prayerRequests = pgTable("prayer_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  isAnonymous: boolean("is_anonymous").default(false),
  isAnswered: boolean("is_answered").default(false),
  prayerCount: integer("prayer_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  certificateUrl: text("certificate_url"), // URL to the generated certificate
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueCertificate: unique().on(table.userId, table.courseId),
}));

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // feeding, homeless, children, automotive, housing, other
  imageUrl: text("image_url"),
  goal: integer("goal"), // Financial goal if applicable
  raised: integer("raised").default(0), // Amount raised if applicable
  volunteersNeeded: integer("volunteers_needed"),
  volunteersSignedUp: integer("volunteers_signed_up").default(0),
  status: text("status").default("active"), // active, completed, paused
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  contactPerson: text("contact_person"),
  contactEmail: text("contact_email"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  voiceParticipations: many(voiceParticipants),
  messages: many(messages),
  prayerRequests: many(prayerRequests),
  createdChannels: many(voiceChannels),
  certificates: many(certificates),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  lessons: many(lessons),
  userProgress: many(userProgress),
  certificates: many(certificates),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [userProgress.courseId],
    references: [courses.id],
  }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const voiceChannelsRelations = relations(voiceChannels, ({ one, many }) => ({
  creator: one(users, {
    fields: [voiceChannels.createdBy],
    references: [users.id],
  }),
  participants: many(voiceParticipants),
}));

export const voiceParticipantsRelations = relations(voiceParticipants, ({ one }) => ({
  channel: one(voiceChannels, {
    fields: [voiceParticipants.channelId],
    references: [voiceChannels.id],
  }),
  user: one(users, {
    fields: [voiceParticipants.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const prayerRequestsRelations = relations(prayerRequests, ({ one }) => ({
  requester: one(users, {
    fields: [prayerRequests.requesterId],
    references: [users.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
}));

// Site Settings - stores all customizable site configuration
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // General Site Information
  siteName: text("site_name").notNull().default("Fellowship Hub"),
  siteTagline: text("site_tagline").default("Resources for Spiritual Growth"),
  contactEmail: text("contact_email").default("contact@fellowshiphub.com"),
  contactPhone: text("contact_phone").default(""),
  address: text("address").default(""),
  
  // Hero Section Content
  heroTitle: text("hero_title").default("Welcome to Our Christian Community"),
  heroSubtitle: text("hero_subtitle").default("Join us in worship, fellowship, and spiritual growth"),
  
  // Features Section
  featuresTitle: text("features_title").default("Resources for Spiritual Growth"),
  featuresSubtitle: text("features_subtitle").default("Everything you need to grow in your faith"),
  
  // Design Settings (stored as JSON for flexibility)
  typography: jsonb("typography").default({
    heroTitleSize: "3xl",      // sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl
    heroSubtitleSize: "xl",
    sectionTitleSize: "2xl",
    cardTitleSize: "lg",
    bodyTextSize: "base"
  }),
  
  layout: jsonb("layout").default({
    cardSize: "normal",         // compact, normal, large
    cardsPerRow: 3,            // 2, 3, 4
    sectionSpacing: "normal",   // compact, normal, spacious
    maxContentWidth: "7xl"      // 5xl, 6xl, 7xl, full
  }),
  
  colors: jsonb("colors").default({
    primary: "hsl(220, 70%, 50%)",
    secondary: "hsl(280, 70%, 50%)",
    accent: "hsl(340, 70%, 50%)"
  }),
  
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeachingSchema = createInsertSchema(teachings).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  totalLessons: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertPrayerRequestSchema = createInsertSchema(prayerRequests).omit({
  id: true,
  prayerCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
});

export const insertVoiceChannelSchema = createInsertSchema(voiceChannels).omit({
  id: true,
  createdAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  completedAt: true,
  createdAt: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  raised: true,
  volunteersSignedUp: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserProfileSchema = z.object({
  nickname: z.string().optional(),
  interests: z.array(z.string()).optional(),
  ministryPreferences: z.array(z.string()).optional(),
  wantToLearn: z.array(z.string()).optional(),
  wantToTeach: z.array(z.string()).optional(),
  privacySettings: z.object({
    showRealName: z.boolean(),
    showEmail: z.boolean(),
    showInterests: z.boolean(),
    showMinistryPreferences: z.boolean(),
    showLearningGoals: z.boolean(),
    showTeachingOfferings: z.boolean(),
  }).optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Teaching = typeof teachings.$inferSelect;
export type InsertTeaching = z.infer<typeof insertTeachingSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type VoiceChannel = typeof voiceChannels.$inferSelect;
export type InsertVoiceChannel = z.infer<typeof insertVoiceChannelSchema>;
export type VoiceParticipant = typeof voiceParticipants.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type PrayerRequest = typeof prayerRequests.$inferSelect;
export type InsertPrayerRequest = z.infer<typeof insertPrayerRequestSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
