import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const kycStatusEnum = pgEnum("kyc_status", ["none", "pending", "verified"]);
export const reviewStatusEnum = pgEnum("review_status", ["pending", "published", "hidden"]);
export const reportStatusEnum = pgEnum("report_status", ["open", "closed"]);
export const visibilityEnum = pgEnum("visibility", ["public", "private"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  username: text("username").notNull().unique(),
  photoUrl: text("photo_url"),
  bio: text("bio"),
  location: text("location"),
  phoneNumber: text("phone_number"),
  phoneVerified: boolean("phone_verified").default(false),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  kycStatus: kycStatusEnum("kyc_status").default("none"),
  kycVerifiedAt: timestamp("kyc_verified_at"),
  role: roleEnum("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const peopleProfiles = pgTable("people_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerUserId: varchar("owner_user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  location: text("location"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  claimed: boolean("claimed").default(false),
  claimedAt: timestamp("claimed_at"),
  profileVisibility: visibilityEnum("profile_visibility").default("public"),
  reviewsVisibility: visibilityEnum("reviews_visibility").default("public"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewerUserId: varchar("reviewer_user_id").references(() => users.id).notNull(),
  targetProfileId: varchar("target_profile_id").references(() => peopleProfiles.id).notNull(),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  status: reviewStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nominations = pgTable("nominations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nominatorUserId: varchar("nominator_user_id").references(() => users.id).notNull(),
  targetFirstName: text("target_first_name").notNull(),
  targetLastName: text("target_last_name").notNull(),
  contactEmailOrPhone: text("contact_email_or_phone").notNull(),
  inviteToken: varchar("invite_token").default(sql`gen_random_uuid()`),
  accepted: boolean("accepted").default(false),
  acceptedByUserId: varchar("accepted_by_user_id").references(() => users.id),
  profileId: varchar("profile_id").references(() => peopleProfiles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterUserId: varchar("reporter_user_id").references(() => users.id).notNull(),
  reviewId: varchar("review_id").references(() => reviews.id).notNull(),
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").default("open"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profileViews = pgTable("profile_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  viewerUserId: varchar("viewer_user_id").references(() => users.id),
  targetProfileId: varchar("target_profile_id").references(() => peopleProfiles.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerUserId: varchar("follower_user_id").references(() => users.id).notNull(),
  targetProfileId: varchar("target_profile_id").references(() => peopleProfiles.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true,
  passwordHash: true 
}).extend({
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const insertPeopleProfileSchema = createInsertSchema(peopleProfiles).omit({ 
  id: true, 
  createdAt: true,
  claimed: true,
  claimedAt: true,
  ownerUserId: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ 
  id: true, 
  createdAt: true,
  reviewerUserId: true,
  status: true,
}).extend({
  rating: z.number().min(1).max(5),
  text: z.string().min(1).max(150),
});

export const insertNominationSchema = createInsertSchema(nominations).omit({ 
  id: true, 
  createdAt: true,
  nominatorUserId: true,
  inviteToken: true,
  accepted: true,
  acceptedByUserId: true,
  profileId: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({ 
  id: true, 
  createdAt: true,
  reporterUserId: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PeopleProfile = typeof peopleProfiles.$inferSelect;
export type InsertPeopleProfile = z.infer<typeof insertPeopleProfileSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Nomination = typeof nominations.$inferSelect;
export type InsertNomination = z.infer<typeof insertNominationSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type ProfileView = typeof profileViews.$inferSelect;
export type Follow = typeof follows.$inferSelect;
