// =====================================================================
// DockOps domain model — dock building & marine construction
// Simplified: 3 core entities, 6-stage pipeline, permit sub-status
// =====================================================================

// ---------------------
// Shared Enums
// ---------------------

export type DockType =
  | "fixed_dock"
  | "floating_dock"
  | "boat_lift"
  | "pier"
  | "repair"
  | "rebuild"
  | "extension";

export const DOCK_TYPE_LABEL: Record<DockType, string> = {
  fixed_dock:    "Fixed Dock",
  floating_dock: "Floating Dock",
  boat_lift:     "Boat Lift",
  pier:          "Pier",
  repair:        "Repair",
  rebuild:       "Rebuild",
  extension:     "Extension",
};

export type Health = "on_track" | "watch" | "at_risk";

// ---------------------
// Job Stage (6 stages)
// ---------------------
// Lead → Estimating → Contracted → Permitting → In Progress → Closed

export type JobStage =
  | "lead"
  | "estimating"
  | "contracted"
  | "permitting"
  | "in_progress"
  | "closed";

export const JOB_STAGES: { id: JobStage; label: string; color: string }[] = [
  { id: "lead",        label: "Lead",        color: "slate" },
  { id: "estimating",  label: "Estimating",  color: "blue" },
  { id: "contracted",  label: "Contracted",  color: "violet" },
  { id: "permitting",  label: "Permitting",  color: "amber" },
  { id: "in_progress", label: "In Progress", color: "green" },
  { id: "closed",      label: "Closed",      color: "gray" },
];

// ---------------------
// Permit Sub-Status
// Only active when job stage === "permitting"
// Lives as fields on the Job — not a separate table
// ---------------------

export type PermitStatus =
  | "not_required"
  | "drafting"
  | "submitted"
  | "in_review"
  | "rfi"
  | "revisions"
  | "approved"
  | "expired";

export const PERMIT_STATUS_LABEL: Record<PermitStatus, string> = {
  not_required: "Not Required",
  drafting:     "Drafting",
  submitted:    "Submitted",
  in_review:    "In Review",
  rfi:          "RFI Pending",
  revisions:    "Revisions",
  approved:     "Approved",
  expired:      "Expired",
};

// Color coding for permit urgency badges
export const PERMIT_STATUS_COLOR: Record<PermitStatus, string> = {
  not_required: "gray",
  drafting:     "blue",
  submitted:    "blue",
  in_review:    "yellow",
  rfi:          "orange",
  revisions:    "orange",
  approved:     "green",
  expired:      "red",
};

export type PermitAgency =
  | "Municipality"
  | "County"
  | "HOA"
  | "FL DEP"
  | "USACE"
  | "FWC"
  | "SWFWMD";

// Derived urgency helper — used for board badge color
export type PermitUrgency = "ok" | "due_soon" | "overdue";

export function getPermitUrgency(
  targetDate: string | null,
  status: PermitStatus
): PermitUrgency {
  if (status === "approved" || status === "not_required") return "ok";
  if (!targetDate) return "ok";
  const daysUntil = Math.ceil(
    (new Date(targetDate).getTime() - Date.now()) / 86_400_000
  );
  if (daysUntil < 0) return "overdue";
  if (daysUntil <= 7) return "due_soon";
  return "ok";
}

// ---------------------
// Schedule Event
// ---------------------

export type ScheduleEventType =
  | "site_visit"
  | "permit_deadline"
  | "material_delivery"
  | "install_start"
  | "install_finish"
  | "inspection";

export interface ScheduleEvent {
  id: string;
  jobId: string | null;   // null = general / not tied to a job
  date: string;           // ISO date string
  endDate?: string;
  type: ScheduleEventType;
  title: string;
  crew?: string;
  note?: string;
}

// ---------------------
// Customer
// ---------------------

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  source?: string;   // referral / google / repeat / etc.
  notes?: string;
}

// ---------------------
// Job  (the core entity)
// ---------------------

export interface Job {
  id: string;
  jobNumber: string;
  customerId: string;

  // Quick-display fields (denormalized from customer for board cards)
  customerName: string;
  address: string;
  city: string;

  dockType: DockType;
  scopeSummary: string;

  stage: JobStage;
  health: Health;
  daysInStage: number;
  blockingIssue: string | null;

  // Financials
  contractAmount: number;
  depositReceived: boolean;

  // Scheduling
  scheduledStart: string | null;
  estCompletion: string | null;

  // Crew
  assignedCrew: string | null;

  // Permit block — active when stage === "permitting"
  // Always stored, only shown prominently during permitting stage
  permitRequired: boolean;
  permitStatus: PermitStatus;
  permitAgency: PermitAgency | null;
  permitSubmittedDate: string | null;
  permitTargetDate: string | null;   // ← drives urgency alerts
  permitNotes: string;

  // Notes
  jobNotes: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Utility: derive permit urgency directly from a job
export function jobPermitUrgency(job: Job): PermitUrgency {
  return getPermitUrgency(job.permitTargetDate, job.permitStatus);
}
