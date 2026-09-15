// Job Status Pipeline
export type JobStatus = "pending" | "scheduled" | "in_progress" | "completed";

export const JOB_STATUSES: { id: JobStatus; label: string; color: string }[] = [
  { id: "pending",      label: "Pending",      color: "slate" },
  { id: "scheduled",    label: "Scheduled",    color: "blue" },
  { id: "in_progress",  label: "In Progress",  color: "green" },
  { id: "completed",    label: "Completed",    color: "gray" },
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

  // Crew
  assignedCrew: string;

  // Notes
  notes: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
