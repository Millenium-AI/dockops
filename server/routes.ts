import type { Express, Response } from "express";
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { storage, ensureAdminSetup } from "./storage";
import cookieParser from "cookie-parser";
import { getQBAuthUrl, exchangeAuthCode, syncEstimates } from "./quickbooks";
import {
  AuthenticatedRequest,
  authMiddleware,
  requireAuth,
  requireAdmin,
  normalizeEmail,
  hashPassword,
  verifyPassword,
  signToken,
} from "./auth";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      email?: string;
      isAdmin?: boolean;
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await ensureAdminSetup();

  app.use(cookieParser());
  app.use(authMiddleware);

  // ── Auth Routes ──

  app.post("/api/auth/signup", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const normalizedEmail = normalizeEmail(email);
      const isWhitelisted = await storage.isEmailWhitelisted(normalizedEmail);
      if (!isWhitelisted) {
        return res.status(403).json({ message: "Email not authorized for signup" });
      }

      const existing = await storage.getUserByEmail(normalizedEmail);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await hashPassword(password);

      const user = await storage.createUser({
        email: normalizedEmail,
        password: hashedPassword,
      });

      const token = signToken(user);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ message: "Signup successful", user: { id: user.id, email: user.email, isAdmin: user.isAdmin } });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ message: "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const normalizedEmail = normalizeEmail(email);
      const user = await storage.getUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const passwordMatch = await verifyPassword(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = signToken(user);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ message: "Login successful", user: { id: user.id, email: user.email, isAdmin: user.isAdmin } });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (_req: AuthenticatedRequest, res: Response) => {
    res.clearCookie("token");
    return res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.json({ id: req.userId, email: req.email, isAdmin: req.isAdmin });
  });

  // ── Admin Routes ──

  app.get("/api/admin/emails", requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const emails = await storage.getWhitelistedEmails();
      return res.json({ emails });
    } catch (error) {
      console.error("Error fetching emails:", error);
      return res.status(500).json({ message: "Failed to fetch emails" });
    }
  });

  app.post("/api/admin/emails", requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }

      const normalizedEmail = normalizeEmail(email);
      const result = await storage.addWhitelistedEmail(normalizedEmail);
      return res.json({ message: "Email added", email: result });
    } catch (error: any) {
      if (error.message?.includes("UNIQUE")) {
        return res.status(400).json({ message: "Email already whitelisted" });
      }
      console.error("Error adding email:", error);
      return res.status(500).json({ message: "Failed to add email" });
    }
  });

  app.delete("/api/admin/emails/:email", requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const email = req.params.email;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email required" });
      }
      await storage.removeWhitelistedEmail(normalizeEmail(email));
      return res.json({ message: "Email removed" });
    } catch (error) {
      console.error("Error removing email:", error);
      return res.status(500).json({ message: "Failed to remove email" });
    }
  });

  // ── QuickBooks Routes ──

  app.get("/api/quickbooks/auth", requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const authUrl = getQBAuthUrl();
    return res.json({ authUrl });
  });

  app.get("/api/quickbooks/callback", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Missing authorization code" });
      }

      const { realmId, accessToken, refreshToken, expiresIn } = await exchangeAuthCode(code);
      await storage.saveQBCredentials(realmId, accessToken, refreshToken, expiresIn);

      return res.json({ message: "QuickBooks connected successfully" });
    } catch (error: any) {
      console.error("QB callback error:", error);
      return res.status(500).json({ message: "Failed to connect QuickBooks" });
    }
  });

  app.post("/api/quickbooks/sync", requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await syncEstimates();
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      return res.json({ message: `Imported ${result.imported} estimates` });
    } catch (error: any) {
      console.error("QB sync error:", error);
      return res.status(500).json({ message: "Failed to sync estimates" });
    }
  });

  return httpServer;
}
