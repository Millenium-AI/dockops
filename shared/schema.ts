import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ---------------------
// Users (auth)
// ---------------------

export const users = sqliteTable("users", {
  id:       integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
  customerId:   text("customer_id").notNull().references(() => customers.id),

  // Denormalized for board card display
  customerName: text("customer_name").notNull().default(""),
  address:      text("address").notNull().default(""),
  city:         text("city").notNull().default(""),

  dockType:     text("dock_type").notNull().default("fixed_dock"),
  scopeSummary: text("scope_summary").default(""),

  // Pipeline
  stage:        text("stage").notNull().default("lead"),
  health:       text("health").notNull().default("on_track"),
  daysInStage:  integer("days_in_stage").notNull().default(0),
  blockingIssue: text("blocking_issue"),

  // Financials
  contractAmount:  real("contract_amount").notNull().default(0),
  depositReceived: integer("deposit_received", { mode: "boolean" }).notNull().default(false),

  // Scheduling
  scheduledStart: text("scheduled_start"),   // ISO date
  estCompletion:  text("est_completion"),     // ISO date

  // Crew
  assignedCrew: text("assigned_crew"),

  // Permit block
  permitRequired:       integer("permit_required", { mode: "boolean" }).notNull().default(false),
  permitStatus:         text("permit_status").notNull().default("not_required"),
  permitAgency:         text("permit_agency"),
  permitSubmittedDate:  text("permit_submitted_date"),  // ISO date
  permitTargetDate:     text("permit_target_date"),     // ISO date — drives urgency
  permitNotes:          text("permit_notes").default(""),

  // Notes
  jobNotes: text("job_notes").default(""),

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
