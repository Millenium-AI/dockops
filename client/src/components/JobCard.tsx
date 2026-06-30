import type { Job } from "../data/types";
import {
  DOCK_TYPE_LABEL,
  PERMIT_STATUS_LABEL,
  PERMIT_STATUS_COLOR,
  jobPermitUrgency,
} from "../data/types";
import { AlertTriangle, Clock, CheckCircle2, DollarSign } from "lucide-react";

interface Props {
  job: Job;
  onClick: (job: Job) => void;
}

// Health dot colors
const HEALTH_COLOR: Record<string, string> = {
  on_track: "bg-green-500",
  watch:    "bg-amber-400",
  at_risk:  "bg-red-500",
};

// Permit urgency badge — semantic utility classes
function PermitBadge({ job }: { job: Job }) {
  if (!job.permitRequired || job.stage !== "permitting") return null;
  const urgency = jobPermitUrgency(job);
  const label = PERMIT_STATUS_LABEL[job.permitStatus];

  if (urgency === "overdue") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold badge-permit-overdue border">
        <AlertTriangle className="w-3 h-3" />
        {label} — Overdue
      </span>
    );
  }
  if (urgency === "due_soon") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold badge-permit-due border">
        <Clock className="w-3 h-3" />
        {label} — Due Soon
      </span>
    );
  }
  // ok / submitted / in_review with time to spare
  const colorClass = PERMIT_STATUS_COLOR[job.permitStatus];
  const isGreen = colorClass === "green";
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold border
      ${isGreen ? "badge-permit-ok" : "badge-permit-blue"}`}>
      {isGreen && <CheckCircle2 className="w-3 h-3" />}
      {label}
    </span>
  );
}

export function JobCard({ job, onClick }: Props) {
  const value = job.contractAmount > 0
    ? `$${(job.contractAmount / 1000).toFixed(0)}k`
    : null;

  return (
    <div
      onClick={() => onClick(job)}
      className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group w-full"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${HEALTH_COLOR[job.health]}`} />
          <span className="text-xs text-muted-foreground font-mono">{job.jobNumber}</span>
        </div>
        {value && (
          <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
            <DollarSign className="w-3 h-3" />{value}
          </span>
        )}
      </div>

      {/* Customer name */}
      <div className="text-sm font-semibold leading-snug mb-0.5 group-hover:text-primary transition-colors truncate">
        {job.customerName}
      </div>

      {/* City + dock type */}
      <div className="text-xs text-muted-foreground mb-2 truncate">
        {job.city} &middot; {DOCK_TYPE_LABEL[job.dockType]}
      </div>

      {/* Permit urgency badge — only shows in Permitting stage */}
      <PermitBadge job={job} />

      {/* Blocking issue */}
      {job.blockingIssue && (
        <div className="mt-2 text-xs badge-blocking border rounded px-2 py-1 leading-snug">
          ⚠ {job.blockingIssue}
        </div>
      )}

      {/* Days in stage */}
      <div className="mt-2 text-xs text-muted-foreground/60">
        {job.daysInStage}d in stage
        {job.assignedCrew && ` · ${job.assignedCrew}`}
      </div>
    </div>
  );
}
