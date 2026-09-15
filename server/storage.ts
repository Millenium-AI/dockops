import { users } from '@shared/schema';
import type { User, InsertUser } from '@shared/schema';
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

// Whitelisted emails
const ALLOWED_EMAILS = [
  "sal@satrianomarine.com",
  "maria@satrianomarine.com",
  "satrianomarine@gmail.com",
];

export function isEmailWhitelisted(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.toLowerCase());
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
}

export const storage = new DatabaseStorage();
