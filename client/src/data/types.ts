// Job Status Pipeline
export type JobStatus = "pending" | "scheduled" | "in_progress" | "completed";

export const JOB_STATUSES: { id: JobStatus; label: string; color: string }[] = [
  { id: "pending",      label: "Pending",      color: "slate" },
  { id: "scheduled",    label: "Scheduled",    color: "blue" },
  { id: "in_progress",  label: "In Progress",  color: "green" },
  { id: "completed",    label: "Completed",    color: "gray" },
];

// Area (geographic regions)
export type Area = "NW" | "NE" | "SE" | "SW" | "MARK";

export const AREAS: { id: Area; label: string; color: string }[] = [
  { id: "NW",   label: "North at Park",        color: "sky" },
  { id: "NE",   label: "Sandy to Crisp",       color: "blue" },
  { id: "SE",   label: "Crisp to Haseline",    color: "emerald" },
  { id: "SW",   label: "Haseline to T.V.",     color: "amber" },
  { id: "MARK", label: "Gulfport/Hamm",        color: "fuchsia" },
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
  assignedBarge: string | null;        // Barge assignment (RANDY, BARGE #2, JOSH, etc.)
  area: Area | null;                   // Geographic area

  // Notes
  notes: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
