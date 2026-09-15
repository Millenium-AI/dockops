import postgres from "postgres";
import type { InsertUser, User, WhitelistedEmail } from '@shared/schema';
import { runMigrations } from "./migrations";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = postgres(connectionString, {
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

export async function ensureAdminSetup() {
  await runMigrations(sql);
}

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
    const result = await sql`
      INSERT INTO users (email, password, is_admin)
      VALUES (${emailLower}, ${insertUser.password}, false)
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
    return result[0] as { realmId: string; accessToken: string; refreshToken: string; expiresAt: Date } | undefined;
  }

  async saveQBAuthState(state: string, expiresAt: Date): Promise<void> {
    await sql`
      INSERT INTO qb_auth_states (state, expires_at)
      VALUES (${state}, ${expiresAt})
    `;
  }

  async validateAndConsumeQBAuthState(state: string): Promise<boolean> {
    const result = await sql`
      UPDATE qb_auth_states
      SET used_at = CURRENT_TIMESTAMP
      WHERE state = ${state}
        AND used_at IS NULL
        AND expires_at > CURRENT_TIMESTAMP
      RETURNING id
    `;
    return result.length > 0;
  }

  async logQBSyncStart(): Promise<number> {
    const result = await sql`
      INSERT INTO qb_sync_audit_log (status)
      VALUES ('pending')
      RETURNING id
    `;
    return result[0].id as number;
  }

  async logQBSyncComplete(id: number, estimatesImported: number, error?: string): Promise<void> {
    await sql`
      UPDATE qb_sync_audit_log
      SET
        completed_at = CURRENT_TIMESTAMP,
        estimates_imported = ${estimatesImported},
        error_message = ${error || null},
        status = ${error ? 'failed' : 'success'}
      WHERE id = ${id}
    `;
  }

  async updateJob(jobId: string, updates: { assignedBarge?: string | null; sortOrder?: number }): Promise<any> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.assignedBarge !== undefined) {
      setClauses.push(`assigned_barge = $${paramIndex}`);
      values.push(updates.assignedBarge || null);
      paramIndex++;
    }

    if (updates.sortOrder !== undefined) {
      setClauses.push(`sort_order = $${paramIndex}`);
      values.push(updates.sortOrder);
      paramIndex++;
    }

    setClauses.push("updated_at = NOW()");

    if (setClauses.length === 1) {
      // Only updated_at, no other changes
      return null;
    }

    values.push(jobId);

    const query = `
      UPDATE jobs
      SET ${setClauses.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await sql.unsafe(query, values);
    return result[0];
  }

}

export const storage = new DatabaseStorage();
