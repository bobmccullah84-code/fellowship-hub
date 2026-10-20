import { db } from "./db";
import { teachings, courses, lessons, projects, voiceChannels, voiceParticipants, users } from "@shared/schema";
import { count, eq } from "drizzle-orm";
import { log } from "./vite";

export async function seedDatabase() {
  try {
    const [teachingCount] = await db.select({ count: count() }).from(teachings);
    const [courseCount] = await db.select({ count: count() }).from(courses);
    const [projectCount] = await db.select({ count: count() }).from(projects);

    if (Number(teachingCount.count) === 0) {
      await seedTeachings();
    }
    if (Number(courseCount.count) === 0) {
      await seedCourses();
    }
    if (Number(projectCount.count) === 0) {
      await seedProjects();
    }

    await applyCorrections();
    await seedVoiceChannels();
  } catch (err) {
    log(`Seed error: ${err}`);
  }
}

async function applyCorrections() {
  await db.update(teachings)
    .set({
      videoUrl: "https://youtu.be/Y_dAOF-9p3s",
      thumbnailUrl: "https://img.youtube.com/vi/Y_dAOF-9p3s/hqdefault.jpg",
      contentType: "youtube",
      speaker: "",
    })
    .where(eq(teachings.title, "Scientific Proof of God"));

  await db.update(teachings)
    .set({ speaker: "Paris Reidhead", audioUrl: null })
    .where(eq(teachings.title, "Ten Shekels And A Shirt by Paris Reidhead (FULL SERMON)"));

  // Remove fake teachings with example.com video URLs
  await db.delete(teachings)
    .where(eq(teachings.title, "The Power of Faith"));
  await db.delete(teachings)
    .where(eq(teachings.title, "Finding Purpose in Christ"));
}

async function seedTeachings() {
  log("Seeding teachings...");
  await db.insert(teachings).values([
    {
      title: "The Power of Faith",
      description: "Understanding how faith transforms our daily lives and relationship with God.",
      speaker: "Pastor John Smith",
      videoUrl: "https://example.com/video1.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      duration: 1800,
      isPublic: true,
      contentType: "video",
    },
    {
      title: "Finding Purpose in Christ",
      description: "Discovering your calling and purpose through a relationship with Jesus.",
      speaker: "Dr. Michael Brown",
      videoUrl: "https://example.com/video3.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      duration: 1950,
      isPublic: true,
      contentType: "video",
    },
    {
      title: "Ten Shekels And A Shirt by Paris Reidhead (FULL SERMON)",
      description: "This message deals with humanism in Christianity.",
      speaker: "Pastor David Wilson",
      videoUrl: "https://www.youtube.com/watch?v=nDQC45_RA2c",
      thumbnailUrl: "https://img.youtube.com/vi/nDQC45_RA2c/hqdefault.jpg",
      duration: 1680,
      isPublic: true,
      contentType: "youtube",
    },
    {
      title: "Scientific Proof of God",
      description: "Science proves that intelligence was required for the universe and life. This video covers the mathematical formulas that make up life and the laws of physics, the fine tuning of the universe and life itself.",
      speaker: "",
      documentUrl: "/public-objects/1760556206772_rbyt9x.pdf",
      thumbnailUrl: "/public-objects/1760556144163_50hqe5.jpg",
      isPublic: true,
      contentType: "document",
    },
    {
      title: "CHARLES G. FINNEY - An Autobiography",
      description: "This book clearly shows how prayer was the key factor in one of the most important revivals in U.S. history.",
      speaker: "Pastor Sarah Johnson",
      thumbnailUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      duration: 2100,
      isPublic: true,
      contentType: "document",
    },
  ]);
  log("Teachings seeded.");
}

async function seedCourses() {
  log("Seeding courses and lessons...");

  const [foundationsCourse] = await db.insert(courses).values({
    title: "Foundations of Faith",
    description: "A comprehensive journey through the essential principles of Christian faith, designed to strengthen your relationship with God and equip you for spiritual growth.",
    thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    totalLessons: 5,
    isPublic: true,
  }).returning();

  const [prayerCourse] = await db.insert(courses).values({
    title: "Prayer and Worship",
    description: "Learn the fundamentals of prayer and worship in your daily Christian walk.",
    thumbnailUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    totalLessons: 4,
    isPublic: true,
  }).returning();

  await db.insert(lessons).values([
    {
      courseId: foundationsCourse.id,
      title: "Introduction to Basic Discipleship",
      description: "Understanding what faith means in the Christian context",
      contentType: "video",
      videoUrl: "https://example.com/lesson1.mp4",
      duration: 1200,
      order: 1,
    },
    {
      courseId: foundationsCourse.id,
      title: "Salvation According to Christ",
      description: "This lesson deals with salvation, according to Jesus.",
      contentType: "text",
      duration: 1500,
      order: 2,
      content: `<div class="lesson-content prose dark:prose-invert max-w-none">
  <div class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border-l-4 border-blue-500">
    <h1 class="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-2">Salvation According to Jesus</h1>
    <p class="text-lg text-blue-700 dark:text-blue-300">Understanding the complete message of salvation from the Author of our faith</p>
  </div>
  <div class="mb-8 p-5 bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 rounded">
    <h2 class="text-2xl font-semibold text-amber-900 dark:text-amber-100 mb-3">The Journey to Understanding</h2>
    <p class="text-gray-700 dark:text-gray-300 mb-3">This lesson deals with salvation, according to Jesus. After studying the verses, the scriptures fell into one of three categories: <strong>belief</strong>, <strong>obedience</strong>, and <strong>total commitment</strong>.</p>
  </div>
  <div class="mb-8 p-6 bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-emerald-500 rounded">
    <h2 class="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">1. Belief</h2>
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-emerald-400">
      <p class="text-emerald-800 dark:text-emerald-200 italic">"For God so loved the world that he gave his only Son, that whoever believes in him should not perish but have eternal life" <span class="font-semibold">(John 3:16)</span></p>
    </div>
    <p class="text-gray-700 dark:text-gray-300 mb-4"><strong>Belief is the key ingredient.</strong> If you don't believe Jesus is God, then you have missed the first and most vital part of salvation.</p>
  </div>
  <div class="mb-8 p-6 bg-purple-50 dark:bg-purple-950/30 border-l-4 border-purple-500 rounded">
    <h2 class="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-4">2. Repentance</h2>
    <div class="bg-white dark:bg-gray-800 p-3 rounded border-l-3 border-purple-300 mb-3">
      <p class="text-sm text-gray-700 dark:text-gray-300 italic">"The time is fulfilled, and the kingdom of God is at hand; repent and believe in the gospel" <span class="font-semibold">(Mark 1:15)</span></p>
    </div>
    <p class="text-gray-700 dark:text-gray-300">Repentance is required; without it, there is no forgiveness or salvation.</p>
  </div>
  <div class="mb-8 p-6 bg-indigo-50 dark:bg-indigo-950/30 border-l-4 border-indigo-500 rounded">
    <h2 class="text-3xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">3. Obedience</h2>
    <div class="bg-white dark:bg-gray-800 p-3 rounded mb-3">
      <p class="text-sm text-gray-700 dark:text-gray-300 italic">"Not everyone who says to me, 'Lord, Lord,' will enter the kingdom of heaven, but only the one who does the will of my Father" <span class="font-semibold">(Matthew 7:21)</span></p>
    </div>
    <p class="text-gray-700 dark:text-gray-300">If you obey Jesus, you remain in his love, just as he obeys the Father and remains in his love.</p>
  </div>
  <div class="mb-8 p-6 bg-rose-50 dark:bg-rose-950/30 border-l-4 border-rose-500 rounded">
    <h2 class="text-3xl font-bold text-rose-900 dark:text-rose-100 mb-4">4. Total Commitment</h2>
    <p class="text-gray-700 dark:text-gray-300 mb-4">Total commitment is a mainstay of Jesus' teachings. He talks about this a lot, and it is the thing most left out of modern-day gospel messages.</p>
    <div class="bg-white dark:bg-gray-800 p-3 rounded mb-3">
      <p class="text-sm text-gray-700 dark:text-gray-300 italic">"Any of you who does not give up everything he has cannot be my disciple" <span class="font-semibold">(Luke 14:33)</span></p>
    </div>
  </div>
</div>`,
    },
    {
      courseId: foundationsCourse.id,
      title: "The Bible: God's Word",
      description: "Exploring the authority and reliability of Scripture",
      contentType: "video",
      videoUrl: "https://example.com/lesson3.mp4",
      duration: 1400,
      order: 3,
    },
    {
      courseId: foundationsCourse.id,
      title: "Prayer and Communication with God",
      description: "Learning to develop a meaningful prayer life",
      contentType: "video",
      videoUrl: "https://example.com/lesson4.mp4",
      duration: 1100,
      order: 4,
    },
    {
      courseId: foundationsCourse.id,
      title: "Living Out Your Faith",
      description: "Practical application of Christian principles in daily life",
      contentType: "video",
      videoUrl: "https://example.com/lesson5.mp4",
      duration: 1300,
      order: 5,
    },
    {
      courseId: prayerCourse.id,
      title: "The Purpose of Prayer",
      description: "Why we pray and how prayer connects us to God",
      contentType: "video",
      videoUrl: "https://example.com/prayer1.mp4",
      duration: 1100,
      order: 1,
    },
    {
      courseId: prayerCourse.id,
      title: "Types of Prayer",
      description: "Adoration, confession, thanksgiving, and supplication",
      contentType: "video",
      videoUrl: "https://example.com/prayer2.mp4",
      duration: 1250,
      order: 2,
    },
    {
      courseId: prayerCourse.id,
      title: "Worship in Spirit and Truth",
      description: "Biblical foundations for worship",
      contentType: "video",
      videoUrl: "https://example.com/prayer3.mp4",
      duration: 1350,
      order: 3,
    },
    {
      courseId: prayerCourse.id,
      title: "Practical Prayer Life",
      description: "Building consistent prayer habits",
      contentType: "video",
      videoUrl: "https://example.com/prayer4.mp4",
      duration: 1200,
      order: 4,
    },
  ]);
  log("Courses and lessons seeded.");
}

async function seedProjects() {
  log("Seeding projects...");
  await db.insert(projects).values([
    {
      title: "Community Feeding Program",
      description: "Weekly meals served to families experiencing food insecurity. We provide nutritious, home-cooked meals every Saturday afternoon at the community center. Join us in fighting hunger!",
      category: "feeding",
      goal: "5000",
      raised: "2800",
      volunteersNeeded: 15,
      volunteersSignedUp: 8,
      status: "active",
      startDate: "2025-01-15",
      endDate: "2025-12-31",
      contactPerson: "Sarah Johnson",
      contactEmail: "sarah@fellowshiphub.com",
      isPublic: true,
    },
    {
      title: "Homeless Winter Shelter",
      description: "Providing warm shelter, meals, and support services to our homeless neighbors during the cold winter months. We need volunteers for overnight shifts and meal preparation.",
      category: "homeless",
      goal: "25000",
      raised: "18500",
      volunteersNeeded: 30,
      volunteersSignedUp: 22,
      status: "active",
      startDate: "2024-11-01",
      endDate: "2025-03-31",
      contactPerson: "Michael Chen",
      contactEmail: "michael@fellowshiphub.com",
      isPublic: true,
    },
    {
      title: "Back to School Supply Drive",
      description: "Help children start the school year with confidence by providing backpacks, notebooks, pencils, and other essential supplies. Every child deserves a fresh start!",
      category: "children",
      goal: "3000",
      raised: "2400",
      volunteersNeeded: 10,
      volunteersSignedUp: 7,
      status: "active",
      startDate: "2025-07-01",
      endDate: "2025-08-31",
      contactPerson: "Emily Rodriguez",
      contactEmail: "emily@fellowshiphub.com",
      isPublic: true,
    },
    {
      title: "Coats for Kids Program",
      description: "No child should be cold. We collect and distribute winter coats to children in need throughout our community. Donations of new or gently-used coats welcome.",
      category: "children",
      goal: "2000",
      raised: "1200",
      volunteersNeeded: 8,
      volunteersSignedUp: 5,
      status: "active",
      startDate: "2024-10-01",
      endDate: "2025-02-28",
      contactPerson: "David Thompson",
      contactEmail: "david@fellowshiphub.com",
      isPublic: true,
    },
    {
      title: "Free Auto Repair Ministry",
      description: "Providing free oil changes and basic automotive repairs to single parents and seniors on fixed incomes. Our certified mechanics volunteer their time and skills.",
      category: "automotive",
      goal: "8000",
      raised: "4500",
      volunteersNeeded: 12,
      volunteersSignedUp: 9,
      status: "active",
      contactPerson: "James Miller",
      contactEmail: "james@fellowshiphub.com",
      isPublic: true,
    },
    {
      title: "Home Repair for Seniors",
      description: "Helping elderly homeowners with minor repairs they can no longer do themselves - fixing leaky faucets, replacing light fixtures, yard work, and more.",
      category: "housing",
      goal: "4000",
      raised: "2100",
      volunteersNeeded: 20,
      volunteersSignedUp: 14,
      status: "active",
      contactPerson: "Patricia Williams",
      contactEmail: "patricia@fellowshiphub.com",
      isPublic: true,
    },
  ]);
  log("Projects seeded.");
}

async function seedVoiceChannels() {
  // Nobody is connected right after a restart
  await db.delete(voiceParticipants);

  const [channelCount] = await db.select({ count: count() }).from(voiceChannels);
  if (Number(channelCount.count) > 0) return;
  const [admin] = await db.select({ id: users.id }).from(users).where(eq(users.isAdmin, true)).limit(1);
  if (!admin) return; // created on a later start, once an admin account exists

  log("Seeding voice channels...");
  await db.insert(voiceChannels).values([
    {
      name: "Fellowship Lounge",
      description: "Open conversation and encouragement",
      isActive: true,
      maxParticipants: 10,
      createdBy: admin.id,
      moderatorId: admin.id,
    },
    {
      name: "Prayer Room",
      description: "Pray together",
      isActive: true,
      maxParticipants: 10,
      createdBy: admin.id,
      moderatorId: admin.id,
    },
  ]);
}
