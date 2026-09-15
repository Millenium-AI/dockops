import { users, whitelistedEmails } from '@shared/schema';
import type { User, InsertUser, WhitelistedEmail, InsertWhitelistedEmail } from '@shared/schema';
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
export const db = drizzle(client);

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
