import { db } from "./db";
import { users, peopleProfiles, reviews, profileViews, follows } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  const [user1] = await db.insert(users).values({
    email: "alice@example.com",
    username: "alice_johnson",
    firstName: "Alice",
    lastName: "Johnson",
    passwordHash,
    role: "user",
    kycStatus: "verified",
    phoneVerified: true,
  }).onConflictDoNothing().returning();

  const [user2] = await db.insert(users).values({
    email: "bob@example.com",
    username: "bob_smith",
    firstName: "Bob",
    lastName: "Smith",
    passwordHash,
    role: "user",
    kycStatus: "verified",
    phoneVerified: true,
  }).onConflictDoNothing().returning();

  const [user3] = await db.insert(users).values({
    email: "charlie@example.com",
    username: "charlie_brown",
    firstName: "Charlie",
    lastName: "Brown",
    passwordHash,
    role: "user",
    kycStatus: "none",
    phoneVerified: false,
  }).onConflictDoNothing().returning();

  if (!user1 || !user2 || !user3) {
    console.log("Users already exist, skipping...");
    process.exit(0);
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [profile1] = await db.insert(peopleProfiles).values({
    firstName: "Alice",
    lastName: "Johnson",
    location: "San Francisco, CA",
    claimed: true,
    ownerUserId: user1.id,
    claimedAt: sevenDaysAgo,
    profileVisibility: "public",
    reviewsVisibility: "public",
  }).returning();

  const [profile2] = await db.insert(peopleProfiles).values({
    firstName: "Bob",
    lastName: "Smith",
    location: "New York, NY",
    claimed: true,
    ownerUserId: user2.id,
    claimedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    profileVisibility: "public",
    reviewsVisibility: "public",
  }).returning();

  const [profile3] = await db.insert(peopleProfiles).values({
    firstName: "Diana",
    lastName: "Prince",
    location: "Los Angeles, CA",
    claimed: false,
    profileVisibility: "public",
    reviewsVisibility: "public",
  }).returning();

  const [profile4] = await db.insert(peopleProfiles).values({
    firstName: "Eve",
    lastName: "Wilson",
    location: "Chicago, IL",
    claimed: true,
    ownerUserId: user3.id,
    claimedAt: new Date(),
    profileVisibility: "public",
    reviewsVisibility: "public",
  }).returning();

  await db.insert(reviews).values([
    {
      targetProfileId: profile1.id,
      reviewerUserId: user2.id,
      rating: 5,
      text: "Alice is incredibly helpful and always goes above and beyond. Highly recommend working with her!",
      status: "published",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      targetProfileId: profile1.id,
      reviewerUserId: user3.id,
      rating: 4,
      text: "Great person to work with. Very professional and punctual.",
      status: "published",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      targetProfileId: profile2.id,
      reviewerUserId: user1.id,
      rating: 5,
      text: "Bob is an amazing collaborator. He always brings creative ideas to the table.",
      status: "published",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      targetProfileId: profile4.id,
      reviewerUserId: user1.id,
      rating: 3,
      text: "Eve is okay to work with. Communication could be improved.",
      status: "published",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ]);

  const now = new Date();
  for (let i = 0; i < 15; i++) {
    await db.insert(profileViews).values({
      targetProfileId: profile1.id,
      createdAt: new Date(now.getTime() - i * 3600000),
    });
  }
  for (let i = 0; i < 8; i++) {
    await db.insert(profileViews).values({
      targetProfileId: profile2.id,
      createdAt: new Date(now.getTime() - i * 7200000),
    });
  }
  for (let i = 0; i < 3; i++) {
    await db.insert(profileViews).values({
      targetProfileId: profile4.id,
      createdAt: new Date(now.getTime() - i * 10800000),
    });
  }

  await db.insert(follows).values([
    {
      followerUserId: user1.id,
      targetProfileId: profile2.id,
    },
    {
      followerUserId: user2.id,
      targetProfileId: profile1.id,
    },
    {
      followerUserId: user3.id,
      targetProfileId: profile1.id,
    },
  ]);

  console.log("Seed completed successfully!");
  console.log("Created users: alice@example.com, bob@example.com, charlie@example.com");
  console.log("Password for all users: password123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
