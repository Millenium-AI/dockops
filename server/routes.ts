import type { Express, Request, Response } from "express";
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { storage } from "./storage";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      email?: string;
      isAdmin?: boolean;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: Function) => {
  const token = req.cookies.token;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.id;
    req.email = decoded.email;
    req.isAdmin = decoded.isAdmin || false;
  } catch (err) {
    res.clearCookie("token");
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(cookieParser());
  app.use(authMiddleware);

  // ── Auth Routes ──

  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const isWhitelisted = await storage.isEmailWhitelisted(email);
      if (!isWhitelisted) {
        return res.status(403).json({ message: "Email not authorized for signup" });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const isAdmin = email.toLowerCase() === "satrianomarine@gmail.com";

      const user = await storage.createUser({
        email,
        password: hashedPassword,
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, isAdmin },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ message: "Signup successful", user: { id: user.id, email: user.email, isAdmin } });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ message: "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

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

  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    res.clearCookie("token");
    return res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.json({ id: req.userId, email: req.email, isAdmin: req.isAdmin });
  });

  // ── Admin Routes ──

  app.get("/api/admin/emails", async (req: Request, res: Response) => {
    if (!req.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const emails = await storage.getWhitelistedEmails();
      return res.json({ emails });
    } catch (error) {
      console.error("Error fetching emails:", error);
      return res.status(500).json({ message: "Failed to fetch emails" });
    }
  });

  app.post("/api/admin/emails", async (req: Request, res: Response) => {
    if (!req.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }

      const result = await storage.addWhitelistedEmail(email);
      return res.json({ message: "Email added", email: result });
    } catch (error: any) {
      if (error.message?.includes("UNIQUE")) {
        return res.status(400).json({ message: "Email already whitelisted" });
      }
      console.error("Error adding email:", error);
      return res.status(500).json({ message: "Failed to add email" });
    }
  });

  app.delete("/api/admin/emails/:email", async (req: Request, res: Response) => {
    if (!req.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { email } = req.params;
      await storage.removeWhitelistedEmail(email);
      return res.json({ message: "Email removed" });
    } catch (error) {
      console.error("Error removing email:", error);
      return res.status(500).json({ message: "Failed to remove email" });
    }
  });

  return httpServer;
}
