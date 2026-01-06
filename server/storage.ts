import { db } from "./db";
import { 
  users, 
  peopleProfiles, 
  reviews, 
  nominations, 
  reports, 
  profileViews,
  follows,
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
  type Follow,
} from "@shared/schema";
import { eq, ilike, or, and, sql, desc, count, gte, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";

export type FeedItem = {
  id: string;
  type: "review" | "profile_claimed" | "user_verified" | "trending";
  createdAt: Date;
  profile: PeopleProfile;
  review?: Review & { reviewer?: { firstName: string; lastName: string; phoneVerified: boolean | null } };
  user?: { firstName: string; lastName: string };
  trendingScore?: number;
};

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

  // Follows
  followProfile(followerUserId: string, targetProfileId: string): Promise<Follow>;
  unfollowProfile(followerUserId: string, targetProfileId: string): Promise<void>;
  isFollowing(followerUserId: string, targetProfileId: string): Promise<boolean>;
  getFollowedProfiles(userId: string): Promise<string[]>;

  // Feed
  getFeed(userId: string, filter: "all" | "reviews" | "new_profiles" | "trending" | "following"): Promise<FeedItem[]>;
  getTrendingProfiles(): Promise<{ profile: PeopleProfile; score: number }[]>;
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
      .set({ ownerUserId: userId, claimed: true, claimedAt: new Date() })
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

  // Follows
  async followProfile(followerUserId: string, targetProfileId: string): Promise<Follow> {
    const existing = await db.select().from(follows)
      .where(and(eq(follows.followerUserId, followerUserId), eq(follows.targetProfileId, targetProfileId)));
    
    if (existing.length > 0) {
      return existing[0];
    }

    const [follow] = await db.insert(follows).values({ followerUserId, targetProfileId }).returning();
    return follow;
  }

  async unfollowProfile(followerUserId: string, targetProfileId: string): Promise<void> {
    await db.delete(follows)
      .where(and(eq(follows.followerUserId, followerUserId), eq(follows.targetProfileId, targetProfileId)));
  }

  async isFollowing(followerUserId: string, targetProfileId: string): Promise<boolean> {
    const [result] = await db.select().from(follows)
      .where(and(eq(follows.followerUserId, followerUserId), eq(follows.targetProfileId, targetProfileId)));
    return !!result;
  }

  async getFollowedProfiles(userId: string): Promise<string[]> {
    const result = await db.select({ targetProfileId: follows.targetProfileId })
      .from(follows)
      .where(eq(follows.followerUserId, userId));
    return result.map(r => r.targetProfileId);
  }

  // Feed
  async getTrendingProfiles(): Promise<{ profile: PeopleProfile; score: number }[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Get view counts in last 7 days
    const viewCounts = await db.select({
      profileId: profileViews.targetProfileId,
      count: count(),
    })
      .from(profileViews)
      .where(gte(profileViews.createdAt, sevenDaysAgo))
      .groupBy(profileViews.targetProfileId);

    // Get review counts in last 7 days
    const reviewCounts = await db.select({
      profileId: reviews.targetProfileId,
      count: count(),
    })
      .from(reviews)
      .where(and(gte(reviews.createdAt, sevenDaysAgo), eq(reviews.status, "published")))
      .groupBy(reviews.targetProfileId);

    // Calculate scores (views + reviews * 10)
    const scores = new Map<string, number>();
    for (const v of viewCounts) {
      scores.set(v.profileId, (scores.get(v.profileId) || 0) + v.count);
    }
    for (const r of reviewCounts) {
      scores.set(r.profileId, (scores.get(r.profileId) || 0) + r.count * 10);
    }

    // Get top profiles
    const sortedProfileIds = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);

    if (sortedProfileIds.length === 0) return [];

    const profiles = await db.select().from(peopleProfiles)
      .where(and(
        inArray(peopleProfiles.id, sortedProfileIds),
        eq(peopleProfiles.profileVisibility, "public")
      ));

    return profiles
      .map(p => ({ profile: p, score: scores.get(p.id) || 0 }))
      .sort((a, b) => b.score - a.score);
  }

  async getFeed(userId: string, filter: "all" | "reviews" | "new_profiles" | "trending" | "following"): Promise<FeedItem[]> {
    const feedItems: FeedItem[] = [];
    const followedIds = filter === "following" ? await this.getFollowedProfiles(userId) : [];

    // Get published reviews
    if (filter === "all" || filter === "reviews" || filter === "following") {
      let reviewQuery = db.select().from(reviews)
        .where(eq(reviews.status, "published"))
        .orderBy(desc(reviews.createdAt))
        .limit(50);

      const publishedReviews = await reviewQuery;

      for (const review of publishedReviews) {
        const profile = await this.getProfile(review.targetProfileId);
        if (!profile || profile.profileVisibility !== "public") continue;
        if (filter === "following" && !followedIds.includes(profile.id)) continue;

        const reviewer = await this.getUser(review.reviewerUserId);
        feedItems.push({
          id: `review-${review.id}`,
          type: "review",
          createdAt: review.createdAt!,
          profile,
          review: {
            ...review,
            reviewer: reviewer ? {
              firstName: reviewer.firstName,
              lastName: reviewer.lastName,
              phoneVerified: reviewer.phoneVerified,
            } : undefined,
          },
        });
      }
    }

    // Get recently claimed profiles
    if (filter === "all" || filter === "new_profiles" || filter === "following") {
      const claimedProfiles = await db.select().from(peopleProfiles)
        .where(and(
          eq(peopleProfiles.claimed, true),
          eq(peopleProfiles.profileVisibility, "public")
        ))
        .orderBy(desc(peopleProfiles.claimedAt))
        .limit(20);

      for (const profile of claimedProfiles) {
        if (filter === "following" && !followedIds.includes(profile.id)) continue;
        if (!profile.claimedAt) continue;

        const owner = profile.ownerUserId ? await this.getUser(profile.ownerUserId) : undefined;
        feedItems.push({
          id: `claimed-${profile.id}`,
          type: "profile_claimed",
          createdAt: profile.claimedAt,
          profile,
          user: owner ? { firstName: owner.firstName, lastName: owner.lastName } : undefined,
        });
      }
    }

    // Get trending profiles
    if (filter === "all" || filter === "trending") {
      const trending = await this.getTrendingProfiles();
      for (const { profile, score } of trending) {
        if (filter === "following" && !followedIds.includes(profile.id)) continue;
        feedItems.push({
          id: `trending-${profile.id}`,
          type: "trending",
          createdAt: new Date(),
          profile,
          trendingScore: score,
        });
      }
    }

    // Sort by date descending and return
    return feedItems
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50);
  }
}

export const storage = new DatabaseStorage();
