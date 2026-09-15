import postgres from "postgres";
import type { InsertUser, User, WhitelistedEmail } from '@shared/schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = postgres(connectionString, {
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

// Initialize tables on startup
async function initializeTables() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create whitelisted_emails table
    await sql`
      CREATE TABLE IF NOT EXISTS whitelisted_emails (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create QB credentials table
    await sql`
      CREATE TABLE IF NOT EXISTS qb_credentials (
        id SERIAL PRIMARY KEY,
        realm_id TEXT UNIQUE NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Add default whitelisted emails
    const emails = [
      "sal@satrianomarine.com",
      "maria@satrianomarine.com",
      "satrianomarine@gmail.com",
    ];
    for (const email of emails) {
      await sql`
        INSERT INTO whitelisted_emails (email)
        VALUES (${email.toLowerCase()})
        ON CONFLICT (email) DO NOTHING
      `;
    }

    console.log("✅ Database tables initialized");
  } catch (err: any) {
    console.error("⚠️  Error initializing tables:", err.message);
  }
}

export async function ensureAdminSetup() {
  await initializeTables();
  try {
    await sql`
      UPDATE users SET is_admin = true WHERE email = 'satrianomarine@gmail.com'
    `;
    console.log("✅ Admin user configured");
  } catch (err: any) {
    console.error("⚠️  Error setting admin:", err.message);
  }
}

initializeTables();

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
    const result = await sql`
      SELECT id, email, password, is_admin as isAdmin, created_at as createdAt
      FROM users WHERE id = ${id}
    `;
    return result[0] as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await sql`
      SELECT id, email, password, is_admin as isAdmin, created_at as createdAt
      FROM users WHERE email = ${email.toLowerCase()}
    `;
    return result[0] as User | undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const emailLower = insertUser.email.toLowerCase();
    const isAdmin = emailLower === 'satrianomarine@gmail.com';
    const result = await sql`
      INSERT INTO users (email, password, is_admin)
      VALUES (${emailLower}, ${insertUser.password}, ${isAdmin})
      RETURNING id, email, password, is_admin as isAdmin, created_at as createdAt
    `;
    if (!result || result.length === 0) {
      throw new Error("Failed to create user");
    }
    return result[0] as User;
  }

  async isEmailWhitelisted(email: string): Promise<boolean> {
    const result = await sql`
      SELECT 1 FROM whitelisted_emails WHERE email = ${email.toLowerCase()}
    `;
    return result.length > 0;
  }

  async getWhitelistedEmails(): Promise<WhitelistedEmail[]> {
    const result = await sql`
      SELECT id, email, created_at as createdAt FROM whitelisted_emails
    `;
    return result as WhitelistedEmail[];
  }

  async addWhitelistedEmail(email: string): Promise<WhitelistedEmail> {
    const result = await sql`
      INSERT INTO whitelisted_emails (email)
      VALUES (${email.toLowerCase()})
      ON CONFLICT DO NOTHING
      RETURNING id, email, created_at as createdAt
    `;
    return result[0] as WhitelistedEmail;
  }

  async removeWhitelistedEmail(email: string): Promise<void> {
    await sql`
      DELETE FROM whitelisted_emails WHERE email = ${email.toLowerCase()}
    `;
  }

  async saveQBCredentials(realmId: string, accessToken: string, refreshToken: string, expiresIn: number): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    await sql`
      INSERT INTO qb_credentials (realm_id, access_token, refresh_token, expires_at)
      VALUES (${realmId}, ${accessToken}, ${refreshToken}, ${expiresAt})
      ON CONFLICT (realm_id) DO UPDATE SET
        access_token = ${accessToken},
        refresh_token = ${refreshToken},
        expires_at = ${expiresAt},
        updated_at = CURRENT_TIMESTAMP
    `;
  }

  async getQBCredentials(): Promise<{ realmId: string; accessToken: string; refreshToken: string; expiresAt: Date } | undefined> {
    const result = await sql`
      SELECT realm_id as realmId, access_token as accessToken, refresh_token as refreshToken, expires_at as expiresAt
      FROM qb_credentials LIMIT 1
    `;
    return result[0];
  }
}

export const storage = new DatabaseStorage();
