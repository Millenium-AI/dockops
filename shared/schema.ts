import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ---------------------
// Users (auth)
// ---------------------

export const users = sqliteTable("users", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  email:     text("email").notNull().unique(),
  password:  text("password").notNull(),
  isAdmin:   integer("is_admin", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ---------------------
// Whitelisted Emails
// ---------------------

export const whitelistedEmails = sqliteTable("whitelisted_emails", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  email:     text("email").notNull().unique(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertWhitelistedEmailSchema = createInsertSchema(whitelistedEmails).pick({
  email: true,
});

export type InsertWhitelistedEmail = z.infer<typeof insertWhitelistedEmailSchema>;
export type WhitelistedEmail = typeof whitelistedEmails.$inferSelect;

// ---------------------
// Customers
// ---------------------

export const customers = sqliteTable("customers", {
  id:      text("id").primaryKey(),
  name:    text("name").notNull(),
  phone:   text("phone").notNull().default(""),
  email:   text("email").notNull().default(""),
  address: text("address").notNull().default(""),
  city:    text("city").notNull().default(""),
  source:  text("source").default(""),
  notes:   text("notes").default(""),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// ---------------------
// Jobs
// ---------------------

export const jobs = sqliteTable("jobs", {
  id:           text("id").primaryKey(),
  jobNumber:    text("job_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").default(""),
  address:      text("address").default(""),

  // Job info
  jobType:      text("job_type").notNull(),  // Category (e.g., dock repair, install, etc.)
  status:       text("status").notNull().default("pending"),  // pending, scheduled, in_progress, completed
  amountOwed:   real("amount_owed").notNull().default(0),
  estimatedDays: integer("estimated_days").notNull().default(0),

  // Scheduling
  scheduledDate: text("scheduled_date"),    // ISO date when work is scheduled
  estimatedCompletionDate: text("estimated_completion_date"), // ISO date

  // Crew
  assignedCrew: text("assigned_crew").default(""),

  // Notes
  notes: text("notes").default(""),

  // Timestamps
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertJobSchema = createInsertSchema(jobs).omit({ id: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// ---------------------
// Schedule Events
// ---------------------

export const scheduleEvents = sqliteTable("schedule_events", {
  id:      text("id").primaryKey(),
  jobId:   text("job_id").references(() => jobs.id),
  date:    text("date").notNull(),       // ISO date
  endDate: text("end_date"),             // ISO date
  type:    text("type").notNull(),       // ScheduleEventType
  title:   text("title").notNull(),
  crew:    text("crew"),
  note:    text("note").default(""),
});

export const insertScheduleEventSchema = createInsertSchema(scheduleEvents).omit({ id: true });
export type InsertScheduleEvent = z.infer<typeof insertScheduleEventSchema>;
export type ScheduleEvent = typeof scheduleEvents.$inferSelect;
