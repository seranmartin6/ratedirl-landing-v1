import { db } from "./db";
import { 
  users, 
  peopleProfiles, 
  reviews, 
  nominations, 
  reports, 
  profileViews,
  type User, 
  type InsertUser,
  type PeopleProfile,
  type InsertPeopleProfile,
  type Review,
  type InsertReview,
  type Nomination,
  type InsertNomination,
  type Report,
  type InsertReport,
} from "@shared/schema";
import { eq, ilike, or, and, sql, desc, count } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  validatePassword(email: string, password: string): Promise<User | null>;

  // People Profiles
  getProfile(id: string): Promise<PeopleProfile | undefined>;
  getProfileByOwner(userId: string): Promise<PeopleProfile | undefined>;
  searchProfiles(query: string, location?: string): Promise<PeopleProfile[]>;
  createProfile(profile: InsertPeopleProfile & { ownerUserId?: string; claimed?: boolean }): Promise<PeopleProfile>;
  updateProfile(id: string, data: Partial<PeopleProfile>): Promise<PeopleProfile | undefined>;
  claimProfile(profileId: string, userId: string): Promise<PeopleProfile | undefined>;

  // Reviews
  getReview(id: string): Promise<Review | undefined>;
  getReviewsForProfile(profileId: string, includeHidden?: boolean): Promise<Review[]>;
  getReviewsByUser(userId: string): Promise<Review[]>;
  createReview(review: InsertReview & { reviewerUserId: string }): Promise<Review>;
  updateReviewStatus(id: string, status: "pending" | "published" | "hidden"): Promise<Review | undefined>;
  getProfileRatingStats(profileId: string): Promise<{ average: number; count: number; breakdown: Record<number, number> }>;

  // Nominations
  getNomination(id: string): Promise<Nomination | undefined>;
  getNominationByToken(token: string): Promise<Nomination | undefined>;
  getNominationsByUser(userId: string): Promise<Nomination[]>;
  createNomination(nomination: InsertNomination & { nominatorUserId: string }): Promise<Nomination>;
  acceptNomination(token: string, userId: string): Promise<Nomination | undefined>;

  // Reports
  getReport(id: string): Promise<Report | undefined>;
  getOpenReports(): Promise<(Report & { review: Review; reporter: User })[]>;
  createReport(report: InsertReport & { reporterUserId: string }): Promise<Report>;
  closeReport(id: string): Promise<Report | undefined>;

  // Analytics
  recordProfileView(targetProfileId: string, viewerUserId?: string): Promise<void>;
  getProfileViewCount(profileId: string): Promise<number>;
  getUserAnalytics(userId: string): Promise<{ profileViews: number; reviewsReceived: number; reviewsGiven: number }>;

  // Admin
  getAllUsers(): Promise<User[]>;
  banUser(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const passwordHash = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db.insert(users).values({
      email: insertUser.email.toLowerCase(),
      passwordHash,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      username: insertUser.username,
      photoUrl: insertUser.photoUrl,
      bio: insertUser.bio,
      location: insertUser.location,
      phoneNumber: insertUser.phoneNumber,
    }).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }

  async getProfile(id: string): Promise<PeopleProfile | undefined> {
    const [profile] = await db.select().from(peopleProfiles).where(eq(peopleProfiles.id, id));
    return profile;
  }

  async getProfileByOwner(userId: string): Promise<PeopleProfile | undefined> {
    const [profile] = await db.select().from(peopleProfiles).where(eq(peopleProfiles.ownerUserId, userId));
    return profile;
  }

  async searchProfiles(query: string, location?: string): Promise<PeopleProfile[]> {
    const searchTerm = `%${query}%`;
    let conditions = or(
      ilike(peopleProfiles.firstName, searchTerm),
      ilike(peopleProfiles.lastName, searchTerm),
      ilike(sql`${peopleProfiles.firstName} || ' ' || ${peopleProfiles.lastName}`, searchTerm)
    );
    
    if (location) {
      conditions = and(conditions, ilike(peopleProfiles.location, `%${location}%`));
    }

    return db.select().from(peopleProfiles)
      .where(and(conditions, eq(peopleProfiles.profileVisibility, "public")))
      .limit(50);
  }

  async createProfile(profile: InsertPeopleProfile & { ownerUserId?: string; claimed?: boolean }): Promise<PeopleProfile> {
    const [newProfile] = await db.insert(peopleProfiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(id: string, data: Partial<PeopleProfile>): Promise<PeopleProfile | undefined> {
    const [profile] = await db.update(peopleProfiles).set(data).where(eq(peopleProfiles.id, id)).returning();
    return profile;
  }

  async claimProfile(profileId: string, userId: string): Promise<PeopleProfile | undefined> {
    const [profile] = await db.update(peopleProfiles)
      .set({ ownerUserId: userId, claimed: true })
      .where(eq(peopleProfiles.id, profileId))
      .returning();
    
    if (profile) {
      await db.update(reviews)
        .set({ status: "published" })
        .where(and(eq(reviews.targetProfileId, profileId), eq(reviews.status, "pending")));
    }
    
    return profile;
  }

  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async getReviewsForProfile(profileId: string, includeHidden = false): Promise<Review[]> {
    const conditions = includeHidden
      ? eq(reviews.targetProfileId, profileId)
      : and(eq(reviews.targetProfileId, profileId), eq(reviews.status, "published"));
    
    return db.select().from(reviews).where(conditions).orderBy(desc(reviews.createdAt));
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.reviewerUserId, userId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview & { reviewerUserId: string }): Promise<Review> {
    const profile = await this.getProfile(review.targetProfileId);
    const status = profile?.claimed ? "published" : "pending";
    
    const [newReview] = await db.insert(reviews).values({
      ...review,
      status,
    }).returning();
    return newReview;
  }

  async updateReviewStatus(id: string, status: "pending" | "published" | "hidden"): Promise<Review | undefined> {
    const [review] = await db.update(reviews).set({ status }).where(eq(reviews.id, id)).returning();
    return review;
  }

  async getProfileRatingStats(profileId: string): Promise<{ average: number; count: number; breakdown: Record<number, number> }> {
    const profileReviews = await db.select().from(reviews)
      .where(and(eq(reviews.targetProfileId, profileId), eq(reviews.status, "published")));
    
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    
    for (const review of profileReviews) {
      breakdown[review.rating] = (breakdown[review.rating] || 0) + 1;
      total += review.rating;
    }
    
    return {
      average: profileReviews.length > 0 ? total / profileReviews.length : 0,
      count: profileReviews.length,
      breakdown,
    };
  }

  async getNomination(id: string): Promise<Nomination | undefined> {
    const [nomination] = await db.select().from(nominations).where(eq(nominations.id, id));
    return nomination;
  }

  async getNominationByToken(token: string): Promise<Nomination | undefined> {
    const [nomination] = await db.select().from(nominations).where(eq(nominations.inviteToken, token));
    return nomination;
  }

  async getNominationsByUser(userId: string): Promise<Nomination[]> {
    return db.select().from(nominations).where(eq(nominations.nominatorUserId, userId));
  }

  async createNomination(nomination: InsertNomination & { nominatorUserId: string }): Promise<Nomination> {
    const profile = await this.createProfile({
      firstName: nomination.targetFirstName,
      lastName: nomination.targetLastName,
      contactEmail: nomination.contactEmailOrPhone.includes("@") ? nomination.contactEmailOrPhone : undefined,
      contactPhone: !nomination.contactEmailOrPhone.includes("@") ? nomination.contactEmailOrPhone : undefined,
    });

    const [newNomination] = await db.insert(nominations).values({
      ...nomination,
      profileId: profile.id,
    }).returning();
    return newNomination;
  }

  async acceptNomination(token: string, userId: string): Promise<Nomination | undefined> {
    const nomination = await this.getNominationByToken(token);
    if (!nomination || nomination.accepted) return undefined;

    const [updated] = await db.update(nominations)
      .set({ accepted: true, acceptedByUserId: userId })
      .where(eq(nominations.inviteToken, token))
      .returning();

    if (updated && updated.profileId) {
      await this.claimProfile(updated.profileId, userId);
    }

    return updated;
  }

  async getReport(id: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async getOpenReports(): Promise<(Report & { review: Review; reporter: User })[]> {
    const openReports = await db.select().from(reports)
      .where(eq(reports.status, "open"))
      .orderBy(desc(reports.createdAt));

    const result = [];
    for (const report of openReports) {
      const review = await this.getReview(report.reviewId);
      const reporter = await this.getUser(report.reporterUserId);
      if (review && reporter) {
        result.push({ ...report, review, reporter });
      }
    }
    return result;
  }

  async createReport(report: InsertReport & { reporterUserId: string }): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async closeReport(id: string): Promise<Report | undefined> {
    const [report] = await db.update(reports).set({ status: "closed" }).where(eq(reports.id, id)).returning();
    return report;
  }

  async recordProfileView(targetProfileId: string, viewerUserId?: string): Promise<void> {
    await db.insert(profileViews).values({ targetProfileId, viewerUserId });
  }

  async getProfileViewCount(profileId: string): Promise<number> {
    const [result] = await db.select({ count: count() }).from(profileViews)
      .where(eq(profileViews.targetProfileId, profileId));
    return result?.count || 0;
  }

  async getUserAnalytics(userId: string): Promise<{ profileViews: number; reviewsReceived: number; reviewsGiven: number }> {
    const profile = await this.getProfileByOwner(userId);
    
    let profileViews = 0;
    let reviewsReceived = 0;
    
    if (profile) {
      profileViews = await this.getProfileViewCount(profile.id);
      const stats = await this.getProfileRatingStats(profile.id);
      reviewsReceived = stats.count;
    }
    
    const givenReviews = await this.getReviewsByUser(userId);
    
    return {
      profileViews,
      reviewsReceived,
      reviewsGiven: givenReviews.length,
    };
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async banUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}

export const storage = new DatabaseStorage();
