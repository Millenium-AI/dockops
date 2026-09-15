import postgres from "postgres";

export interface Migration {
  version: number;
  name: string;
  up: (sql: ReturnType<typeof postgres>) => Promise<void>;
}

const migrations: Migration[] = [
  {
    version: 1,
    name: "init_schema",
    up: async (sql) => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          is_admin BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS whitelisted_emails (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

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
    },
  },
  {
    version: 2,
    name: "bootstrap_whitelisted_emails",
    up: async (sql) => {
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
    },
  },
  {
    version: 3,
    name: "add_qb_auth_state_tracking",
    up: async (sql) => {
      await sql`
        CREATE TABLE IF NOT EXISTS qb_auth_states (
          id SERIAL PRIMARY KEY,
          state TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          used_at TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS qb_sync_audit_log (
          id SERIAL PRIMARY KEY,
          started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          estimates_imported INT DEFAULT 0,
          error_message TEXT,
          status TEXT DEFAULT 'pending'
        )
      `;
    },
  },
  {
    version: 4,
    name: "create_jobs_and_add_sort_order",
    up: async (sql) => {
      await sql`
        CREATE TABLE IF NOT EXISTS jobs (
          id TEXT PRIMARY KEY,
          customer_name TEXT NOT NULL,
          job_number TEXT NOT NULL,
          job_type TEXT NOT NULL,
          area TEXT,
          amount_owed INT DEFAULT 0,
          lead_guy TEXT,
          assigned_barge TEXT,
          sort_order INT DEFAULT 0,
          scheduled_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    },
  },
];

export async function runMigrations(sql: ReturnType<typeof postgres>) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS _schema_version (
        version INT PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const result = await sql`
      SELECT version FROM _schema_version ORDER BY version DESC LIMIT 1
    `;
    const currentVersion = result[0]?.version ?? 0;

    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        console.log(`Running migration ${migration.version}: ${migration.name}`);
        await migration.up(sql);
        await sql`
          INSERT INTO _schema_version (version, name)
          VALUES (${migration.version}, ${migration.name})
        `;
        console.log(`✅ Migration ${migration.version} completed`);
      }
    }

    console.log("✅ All migrations completed successfully");
  } catch (err: any) {
    console.error("❌ Migration failed:", err.message);
    throw err;
  }
}
