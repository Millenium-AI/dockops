import { users, whitelistedEmails } from '@shared/schema';
import type { User, InsertUser, WhitelistedEmail, InsertWhitelistedEmail } from '@shared/schema';
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

// Initialize schema if tables don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS whitelisted_emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    isAdmin INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// Initialize with default whitelisted emails if they don't exist
async function initializeWhitelist() {
  try {
    // Try to check if table exists by querying it
    const existing = await db.select().from(whitelistedEmails).all();
    if (existing.length === 0) {
      const defaultEmails = [
        "sal@satrianomarine.com",
        "maria@satrianomarine.com",
        "satrianomarine@gmail.com",
      ];
      for (const email of defaultEmails) {
        await db.insert(whitelistedEmails).values({ email }).catch(() => {});
      }
    }
  } catch (err: any) {
    // Table doesn't exist yet - will be created by drizzle or on first access
    console.log("Whitelist table not found, will initialize on first use");
  }
}

initializeWhitelist();

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  isEmailWhitelisted(email: string): Promise<boolean>;
  getWhitelistedEmails(): Promise<WhitelistedEmail[]>;
  addWhitelistedEmail(email: string): Promise<WhitelistedEmail>;
  removeWhitelistedEmail(email: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.email, email.toLowerCase())).get();
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return db.insert(users).values({
      ...insertUser,
      email: insertUser.email.toLowerCase(),
    }).returning().get();
  }

  async isEmailWhitelisted(email: string): Promise<boolean> {
    const result = await db.select().from(whitelistedEmails)
      .where(eq(whitelistedEmails.email, email.toLowerCase()))
      .get();
    return !!result;
  }

  async getWhitelistedEmails(): Promise<WhitelistedEmail[]> {
    return db.select().from(whitelistedEmails).all();
  }

  async addWhitelistedEmail(email: string): Promise<WhitelistedEmail> {
    return db.insert(whitelistedEmails).values({ email: email.toLowerCase() }).returning().get();
  }

  async removeWhitelistedEmail(email: string): Promise<void> {
    await db.delete(whitelistedEmails).where(eq(whitelistedEmails.email, email.toLowerCase()));
  }
}

export const storage = new DatabaseStorage();
