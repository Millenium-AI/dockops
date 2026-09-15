import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// MCP Tool: Query any table
export async function queryTable(table: string, filters?: Record<string, any>) {
  try {
    let query = supabase.from(table).select("*");

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// MCP Tool: Get single record
export async function getRecord(table: string, id: string | number) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// MCP Tool: List all users
export async function listUsers() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, isAdmin, createdAt");

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// MCP Tool: List whitelisted emails
export async function listWhitelistedEmails() {
  try {
    const { data, error } = await supabase
      .from("whitelisted_emails")
      .select("*");

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// MCP Tool: Add whitelisted email
export async function addWhitelistedEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from("whitelisted_emails")
      .insert([{ email: email.toLowerCase() }])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// MCP Tool: Remove whitelisted email
export async function removeWhitelistedEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from("whitelisted_emails")
      .delete()
      .eq("email", email.toLowerCase());

    if (error) throw error;
    return { success: true, data: `Removed ${email}` };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

console.log("✅ Supabase MCP server ready");
