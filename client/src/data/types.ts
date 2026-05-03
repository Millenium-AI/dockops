// =====================================================================
// DockOps domain model — dock building & marine construction
// =====================================================================

export type SalesStage =
  | "new_lead"
  | "contact_attempted"
  | "qualified"
  | "site_visit_scheduled"
  | "site_visit_completed"
  | "estimating"
  | "proposal_sent"
  | "follow_up"
  | "negotiation"
  | "contract_out"
  | "deposit_received"
  | "closed_won"
  | "closed_lost";

export const SALES_STAGES: { id: SalesStage; label: string; short: string }[] = [
  { id: "new_lead",            label: "New Lead",            short: "New" },
  { id: "contact_attempted",   label: "Contact Attempted",   short: "Contact" },
  { id: "qualified",           label: "Qualified",           short: "Qualified" },
  { id: "site_visit_scheduled",label: "Site Visit Scheduled",short: "Visit Scheduled" },
  { id: "site_visit_completed",label: "Site Visit Completed",short: "Visit Done" },
  { id: "estimating",          label: "Estimating",          short: "Estimating" },
  { id: "proposal_sent",       label: "Proposal Sent",       short: "Proposal" },
  { id: "follow_up",           label: "Follow-up",           short: "Follow-up" },
  { id: "negotiation",         label: "Negotiation",         short: "Negotiation" },
  { id: "contract_out",        label: "Contract Out",        short: "Contract" },
  { id: "deposit_received",    label: "Deposit Received",    short: "Deposit In" },
  { id: "closed_won",          label: "Closed Won",          short: "Won" },
  { id: "closed_lost",         label: "Closed Lost",         short: "Lost" },
];

export type ProjectStage =
  | "sold_handoff"
  | "site_data_verified"
  | "design_engineering"
  | "permit_in_progress"
  | "permit_submitted"
  | "permit_revisions"
  | "permit_approved"
  | "materials_ordered"
  | "fabrication_prep"
  | "scheduled"
  | "mobilization"
  | "piles_foundation"
  | "framing"
  | "decking"
  | "accessories_finish"
  | "punch_list"
  | "final_inspection"
  | "final_invoice"
  | "closed";

export const PROJECT_STAGES: { id: ProjectStage; label: string; group: string }[] = [
  { id: "sold_handoff",        label: "Sold / Handoff",          group: "Pre-Production" },
  { id: "site_data_verified",  label: "Site Data Verified",      group: "Pre-Production" },
  { id: "design_engineering",  label: "Design / Engineering",    group: "Pre-Production" },
  { id: "permit_in_progress",  label: "Permit In Progress",      group: "Permitting" },
  { id: "permit_submitted",    label: "Permit Submitted",        group: "Permitting" },
  { id: "permit_revisions",    label: "Permit Revisions",        group: "Permitting" },
  { id: "permit_approved",     label: "Permit Approved",         group: "Permitting" },
  { id: "materials_ordered",   label: "Materials Ordered",       group: "Procurement" },
  { id: "fabrication_prep",    label: "Fabrication / Prep",      group: "Procurement" },
  { id: "scheduled",           label: "Scheduled",               group: "Procurement" },
  { id: "mobilization",        label: "Mobilization",            group: "Build" },
  { id: "piles_foundation",    label: "Piles / Foundation",      group: "Build" },
  { id: "framing",             label: "Framing",                 group: "Build" },
  { id: "decking",             label: "Decking",                 group: "Build" },
  { id: "accessories_finish",  label: "Accessories / Finish",    group: "Build" },
  { id: "punch_list",          label: "Punch List",              group: "Closeout" },
  { id: "final_inspection",    label: "Final Inspection",        group: "Closeout" },
  { id: "final_invoice",       label: "Final Invoice",           group: "Closeout" },
  { id: "closed",              label: "Closed",                  group: "Closeout" },
];

export type Health = "on_track" | "watch" | "at_risk";
export type Temperature = "cold" | "warm" | "hot";

export type DockType =
  | "fixed_dock"
  | "floating_dock"
  | "pier"
  | "platform"
  | "gangway"
  | "boat_lift"
  | "seawall_adjacent"
  | "repair"
  | "rebuild"
  | "extension";

export const DOCK_TYPE_LABEL: Record<DockType, string> = {
  fixed_dock: "Fixed Dock",
  floating_dock: "Floating Dock",
  pier: "Pier",
  platform: "Platform",
  gangway: "Gangway",
  boat_lift: "Boat Lift",
  seawall_adjacent: "Seawall Adjacent",
  repair: "Repair",
  rebuild: "Rebuild",
  extension: "Extension",
};

export type WaterfrontType = "lake" | "river" | "canal" | "bay" | "tidal" | "non_tidal";
export type BottomType = "sand" | "mud" | "rock" | "limestone" | "mixed" | "muck";
export type AccessDifficulty = "easy" | "moderate" | "difficult" | "barge_only";
export type StructureCondition = "n/a" | "good" | "fair" | "poor" | "failing";
export type WeatherSensitivity = "low" | "medium" | "high";
export type MobilizationComplexity = "simple" | "standard" | "complex" | "barge_required";

export type PermitAgency =
  | "Municipality"
  | "County"
  | "HOA"
  | "FL DEP"
  | "USACE"
  | "FWC"
  | "SWFWMD";

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
  drafting: "Drafting",
  submitted: "Submitted",
  in_review: "In Review",
  rfi: "RFI Pending",
  revisions: "Revisions",
  approved: "Approved",
  expired: "Expired",
};

export type DepositStatus = "not_invoiced" | "invoiced" | "partial" | "received" | "waived";

export interface Lead {
  id: string;
  customer: string;
  address: string;
  city: string;
  source: string;
  dockType: DockType;
  scopeNote: string;
  estimatedValue: number;
  probability: number;
  lastContactDate: string;   // ISO
  nextActionDate: string | null;
  nextActionNote: string;
  owner: string;
  temperature: Temperature;
  stage: SalesStage;
  daysInStage: number;
  daysSinceContact: number;
  notes?: string;
  phone: string;
  email: string;
}

export interface Permit {
  id: string;
  projectId: string;
  jurisdiction: string;
  agency: PermitAgency;
  permitType: string;
  drawingsNeeded: boolean;
  engineeringNeeded: boolean;
  submissionDate: string | null;
  status: PermitStatus;
  reviewerComments: string;
  revisionDueDate: string | null;
  approvalTargetDate: string | null;
  inspectionRequirements: string;
  ageDays: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  type: "deposit" | "progress" | "final" | "change_order";
  amount: number;
  issuedDate: string | null;
  dueDate: string | null;
  paidDate: string | null;
  status: "draft" | "sent" | "paid" | "overdue";
  note?: string;
}

export interface ScheduleItem {
  id: string;
  projectId?: string;
  leadId?: string;
  date: string;            // ISO date
  endDate?: string;
  type:
    | "site_visit"
    | "estimate_review"
    | "permit_deadline"
    | "material_delivery"
    | "fabrication_milestone"
    | "mobilization"
    | "install_start"
    | "install_finish"
    | "inspection";
  title: string;
  crew?: string;
  equipment?: string[];
  weatherRisk?: "low" | "medium" | "high";
  note?: string;
}

export interface Crew {
  id: string;
  name: string;
  lead: string;
  size: number;
  specialties: string[];
}

export interface Equipment {
  id: string;
  name: string;
  type: "barge" | "pile_driver" | "crane" | "boat" | "trailer" | "specialty";
  status: "available" | "in_use" | "maintenance";
  assignedProject?: string;
}

export interface CommLog {
  id: string;
  date: string;
  channel: "call" | "email" | "text" | "site" | "note";
  by: string;
  note: string;
}

export interface ChangeOrder {
  id: string;
  projectId: string;
  date: string;
  description: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "billed";
}

export interface Project {
  id: string;
  jobNumber: string;
  customer: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  dockType: DockType;
  scopeSummary: string;
  contractAmount: number;
  marginEstimate: number;     // %
  actualCostToDate: number;
  depositStatus: DepositStatus;
  depositAmount: number;
  scheduledStart: string | null;
  forecastCompletion: string | null;
  projectManager: string;
  crewId: string | null;
  health: Health;
  stage: ProjectStage;
  daysInStage: number;
  blockingIssue: string | null;

  // Site / waterfront
  waterfrontType: WaterfrontType;
  waterDepthFt: number;
  bottomType: BottomType;
  accessDifficulty: AccessDifficulty;
  existingStructureCondition: StructureCondition;
  weatherSensitivity: WeatherSensitivity;
  mobilizationComplexity: MobilizationComplexity;

  // Materials
  pileType: string;
  framingMaterial: string;
  deckingMaterial: string;
  accessories: string[];

  // Counts
  changeOrderCount: number;

  // Communication
  comms: CommLog[];
  jobNotes: string;
  warrantyNotes?: string;
}

export type AlertSeverity = "info" | "warn" | "danger";

export interface AppAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  refType: "lead" | "project" | "permit" | "invoice";
  refId: string;
  daysOld?: number;
}
