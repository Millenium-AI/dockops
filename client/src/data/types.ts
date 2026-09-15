// Job Status Pipeline
export type JobStatus = "pending" | "scheduled" | "in_progress" | "completed";

export const JOB_STATUSES: { id: JobStatus; label: string; color: string }[] = [
  { id: "pending",      label: "Pending",      color: "slate" },
  { id: "scheduled",    label: "Scheduled",    color: "blue" },
  { id: "in_progress",  label: "In Progress",  color: "green" },
  { id: "completed",    label: "Completed",    color: "gray" },
];

// Area (geographic regions)
export type Area = "NW" | "Beaches" | "TI" | "NE" | "SE" | "MAXI";

export const AREAS: { id: Area; label: string; color: string }[] = [
  { id: "NW",      label: "NW",       color: "blue" },
  { id: "Beaches", label: "Beaches",  color: "slate" },
  { id: "TI",      label: "TI",       color: "orange" },
  { id: "NE",      label: "NE",       color: "pink" },
  { id: "SE",      label: "SE",       color: "purple" },
  { id: "MAXI",    label: "MAXI",     color: "green" },
];

// Job Type (configurable in settings)
export interface JobType {
  id: string;
  name: string;
  color: string;
}

// Job entity
export interface Job {
  id: string;
  jobNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;

  jobType: string;      // references JobType.id
  status: JobStatus;
  amountOwed: number;
  estimatedDays: number;

  // Scheduling
  scheduledDate: string | null;        // ISO date
  estimatedCompletionDate: string | null; // ISO date

  // Crew & Barge
  assignedCrew: string;
  assignedBarge: string | null;        // Barge assignment (Barge 1, Barge 2, etc.)
  area: Area | null;                   // Geographic area
  leadGuy: string | null;              // Lead person on barge

  // Notes
  notes: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
