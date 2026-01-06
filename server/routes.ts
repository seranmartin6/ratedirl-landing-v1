import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  loginSchema, 
  insertReviewSchema, 
  insertNominationSchema, 
  insertReportSchema,
  insertPeopleProfileSchema 
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { randomUUID } from "crypto";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import { ObjectStorageService } from "./replit_integrations/object_storage";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const PgSession = connectPgSimple(session);

const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pgPool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.use(session({
    secret: process.env.SESSION_SECRET || randomUUID(),
    resave: false,
    saveUninitialized: false,
    store: new PgSession({
      pool: pgPool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
  }));

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }

      // Explicit server-side ToS validation
      if (!result.data.tosVersion || result.data.tosVersion.trim() === "") {
        return res.status(400).json({ message: "You must accept the Terms of Service to create an account." });
      }

      const existing = await storage.getUserByEmail(result.data.email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(result.data.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const user = await storage.createUser(result.data);
      
      // Auto-create profile for user
      await storage.createProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        location: user.location || undefined,
        ownerUserId: user.id,
        claimed: true,
      });

      req.session.userId = user.id;
      res.json({ user: { ...user, passwordHash: undefined } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }

      const user = await storage.validatePassword(result.data.email, result.data.password);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      res.json({ user: { ...user, passwordHash: undefined } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json({ user: { ...user, passwordHash: undefined } });
  });

  // Profile routes
  app.get("/api/profiles/search", async (req, res) => {
    const { q, location } = req.query;
    const profiles = await storage.searchProfiles(
      (q as string) || "", 
      location as string | undefined
    );
    
    // Add owner photo URL to each profile
    const profilesWithPhotos = await Promise.all(profiles.map(async (profile) => {
      let ownerPhotoUrl = null;
      if (profile.ownerUserId) {
        const owner = await storage.getUser(profile.ownerUserId);
        ownerPhotoUrl = owner?.photoUrl;
      }
      return { ...profile, ownerPhotoUrl };
    }));
    
    res.json(profilesWithPhotos);
  });

  app.get("/api/profiles/:id", async (req, res) => {
    const profile = await storage.getProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const isOwner = req.session.userId && profile.ownerUserId === req.session.userId;
    
    // Check profile visibility
    if (profile.profileVisibility === "private" && !isOwner) {
      return res.status(403).json({ message: "This profile is private" });
    }

    // Record view
    await storage.recordProfileView(profile.id, req.session.userId);

    const stats = await storage.getProfileRatingStats(profile.id);
    
    // Get owner's photo URL
    let ownerPhotoUrl = null;
    if (profile.ownerUserId) {
      const owner = await storage.getUser(profile.ownerUserId);
      ownerPhotoUrl = owner?.photoUrl;
    }
    
    // Respect reviews visibility
    let reviews: any[] = [];
    if (profile.reviewsVisibility === "public" || isOwner) {
      const profileReviews = await storage.getReviewsForProfile(profile.id);
      
      // Get reviewer info for each review
      reviews = await Promise.all(profileReviews.map(async (review) => {
        const reviewer = await storage.getUser(review.reviewerUserId);
        return {
          ...review,
          reviewer: reviewer ? { 
            firstName: reviewer.firstName, 
            lastName: reviewer.lastName,
            phoneVerified: reviewer.phoneVerified,
            photoUrl: reviewer.photoUrl
          } : null,
        };
      }));
    }

    res.json({ profile, stats, reviews, ownerPhotoUrl });
  });

  app.get("/api/profiles/my/profile", requireAuth, async (req, res) => {
    const profile = await storage.getProfileByOwner(req.session.userId!);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  app.patch("/api/profiles/:id", requireAuth, async (req, res) => {
    const profile = await storage.getProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    if (profile.ownerUserId !== req.session.userId) {
      return res.status(403).json({ message: "Not your profile" });
    }
    const updated = await storage.updateProfile(req.params.id, req.body);
    res.json(updated);
  });

  app.post("/api/profiles/:id/claim", requireAuth, async (req, res) => {
    const profile = await storage.getProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    if (profile.claimed) {
      return res.status(400).json({ message: "Profile already claimed" });
    }
    const updated = await storage.claimProfile(req.params.id, req.session.userId!);
    res.json(updated);
  });

  // Review routes
  app.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const result = insertReviewSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }

      const profile = await storage.getProfile(result.data.targetProfileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Can't review yourself
      if (profile.ownerUserId === req.session.userId) {
        return res.status(400).json({ message: "Cannot review yourself" });
      }

      const review = await storage.createReview({
        ...result.data,
        reviewerUserId: req.session.userId!,
      });
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reviews/my", requireAuth, async (req, res) => {
    const reviews = await storage.getReviewsByUser(req.session.userId!);
    res.json(reviews);
  });

  // Nomination routes
  app.post("/api/nominations", requireAuth, async (req, res) => {
    try {
      const result = insertNominationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }

      const nomination = await storage.createNomination({
        ...result.data,
        nominatorUserId: req.session.userId!,
      });
      res.json(nomination);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/nominations/my", requireAuth, async (req, res) => {
    const nominations = await storage.getNominationsByUser(req.session.userId!);
    res.json(nominations);
  });

  app.post("/api/nominations/accept/:token", requireAuth, async (req, res) => {
    const nomination = await storage.acceptNomination(req.params.token, req.session.userId!);
    if (!nomination) {
      return res.status(404).json({ message: "Invalid or already used invite" });
    }
    res.json(nomination);
  });

  app.get("/api/nominations/token/:token", async (req, res) => {
    const nomination = await storage.getNominationByToken(req.params.token);
    if (!nomination) {
      return res.status(404).json({ message: "Invalid invite" });
    }
    res.json(nomination);
  });

  // Report routes
  app.post("/api/reports", requireAuth, async (req, res) => {
    try {
      const result = insertReportSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }

      const report = await storage.createReport({
        ...result.data,
        reporterUserId: req.session.userId!,
      });
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User settings
  app.patch("/api/users/me", requireAuth, async (req, res) => {
    const user = await storage.updateUser(req.session.userId!, req.body);
    res.json({ ...user, passwordHash: undefined });
  });

  app.post("/api/users/me/verify-phone", requireAuth, async (req, res) => {
    // MVP placeholder - just mark as verified
    const user = await storage.updateUser(req.session.userId!, { phoneVerified: true });
    res.json({ ...user, passwordHash: undefined });
  });

  // Analytics
  app.get("/api/analytics", requireAuth, async (req, res) => {
    const analytics = await storage.getUserAnalytics(req.session.userId!);
    res.json(analytics);
  });

  // Admin routes
  app.get("/api/admin/reports", requireAdmin, async (req, res) => {
    const reports = await storage.getOpenReports();
    res.json(reports);
  });

  app.post("/api/admin/reports/:id/close", requireAdmin, async (req, res) => {
    const report = await storage.closeReport(req.params.id);
    res.json(report);
  });

  app.post("/api/admin/reviews/:id/hide", requireAdmin, async (req, res) => {
    const review = await storage.updateReviewStatus(req.params.id, "hidden");
    res.json(review);
  });

  app.post("/api/admin/reviews/:id/publish", requireAdmin, async (req, res) => {
    const review = await storage.updateReviewStatus(req.params.id, "published");
    res.json(review);
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users.map(u => ({ ...u, passwordHash: undefined })));
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    await storage.banUser(req.params.id);
    res.json({ success: true });
  });

  // Feed routes
  app.get("/api/feed", requireAuth, async (req, res) => {
    const filter = (req.query.filter as string) || "all";
    const validFilters = ["all", "reviews", "new_profiles", "trending", "following"];
    if (!validFilters.includes(filter)) {
      return res.status(400).json({ message: "Invalid filter" });
    }
    const feed = await storage.getFeed(req.session.userId!, filter as any);
    res.json(feed);
  });

  // Follow routes
  app.post("/api/follow/:profileId", requireAuth, async (req, res) => {
    const profile = await storage.getProfile(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    const follow = await storage.followProfile(req.session.userId!, req.params.profileId);
    res.json(follow);
  });

  app.delete("/api/follow/:profileId", requireAuth, async (req, res) => {
    await storage.unfollowProfile(req.session.userId!, req.params.profileId);
    res.json({ success: true });
  });

  app.get("/api/follow/:profileId", requireAuth, async (req, res) => {
    const isFollowing = await storage.isFollowing(req.session.userId!, req.params.profileId);
    res.json({ isFollowing });
  });

  // Profile picture upload routes
  const objectStorageService = new ObjectStorageService();

  app.post("/api/uploads/profile-picture", requireAuth, async (req, res) => {
    try {
      const { name, size, contentType } = req.body;
      if (!name || !contentType) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Validate file type
      if (!contentType.startsWith("image/")) {
        return res.status(400).json({ error: "Only image files are allowed" });
      }
      
      // Validate file size (5MB max)
      if (size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "File size must be under 5MB" });
      }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      
      // Extract the object path from the signed URL
      // The URL format is: https://storage.googleapis.com/bucket-name/.private/uploads/uuid?...
      const url = new URL(uploadURL);
      const pathParts = url.pathname.split("/");
      // Find the uploads/uuid part
      const uploadsIndex = pathParts.findIndex(p => p === "uploads");
      if (uploadsIndex !== -1 && pathParts[uploadsIndex + 1]) {
        const objectId = pathParts[uploadsIndex + 1];
        const objectPath = `/objects/uploads/${objectId}`;
        res.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
      } else {
        throw new Error("Failed to parse upload URL");
      }
    } catch (error: any) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.post("/api/users/me/profile-picture", requireAuth, async (req, res) => {
    try {
      const { objectPath } = req.body;
      if (!objectPath || !objectPath.startsWith("/objects/")) {
        return res.status(400).json({ error: "Invalid object path" });
      }

      // Try to set ACL policy for the uploaded image (make it public)
      try {
        const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
        const { setObjectAclPolicy } = await import("./replit_integrations/object_storage/objectAcl");
        await setObjectAclPolicy(objectFile, { 
          owner: req.session.userId!, 
          visibility: "public" 
        });
      } catch (aclError: any) {
        console.warn("Could not set ACL policy:", aclError.message);
        // Continue anyway - the file was uploaded
      }

      // Update user's photo URL
      const user = await storage.updateUser(req.session.userId!, {
        photoUrl: objectPath,
      });

      res.json({ user: { ...user, passwordHash: undefined } });
    } catch (error: any) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ error: "Failed to update profile picture" });
    }
  });

  // Serve uploaded objects
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error: any) {
      console.error("Error serving object:", error);
      if (error.name === "ObjectNotFoundError") {
        return res.status(404).json({ error: "Object not found" });
      }
      return res.status(500).json({ error: "Failed to serve object" });
    }
  });

  return httpServer;
}
