import { X, MapPin, Wrench, FileCheck2, CalendarRange, StickyNote, DollarSign, Users } from "lucide-react";
import type { Job } from "../data/types";
import {
  DOCK_TYPE_LABEL,
  JOB_STAGES,
  PERMIT_STATUS_LABEL,
  PERMIT_STATUS_COLOR,
  jobPermitUrgency,
} from "../data/types";

interface Props {
  job: Job | null;
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-4 mt-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-0.5">
      <span className="text-[12px] text-muted-foreground shrink-0">{label}</span>
      <span className="text-[12px] font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}

const URGENCY_STYLE = {
  overdue:  "bg-red-100 text-red-700 border border-red-200",
  due_soon: "bg-amber-100 text-amber-700 border border-amber-200",
  ok:       "bg-green-100 text-green-700 border border-green-200",
};

export function JobDrawer({ job, onClose }: Props) {
  if (!job) return null;

  const stageLabel = JOB_STAGES.find(s => s.id === job.stage)?.label ?? job.stage;
  const urgency = jobPermitUrgency(job);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-background border-l border-border shadow-xl z-50 flex flex-col">

        {/* Drawer header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border">
          <div>
            <div className="text-[11px] font-mono text-muted-foreground mb-0.5">{job.jobNumber}</div>
            <div className="text-[17px] font-bold leading-tight">{job.customerName}</div>
            <div className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />{job.address}, {job.city}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Stage + Health */}
          <Section title="Status">
            <Row label="Stage" value={stageLabel} />
            <Row label="Health" value={
              <span className={`capitalize font-semibold ${
                job.health === "on_track" ? "text-green-600" :
                job.health === "watch" ? "text-amber-600" : "text-red-600"
              }`}>{job.health.replace("_", " ")}</span>
            } />
            <Row label="Days in stage" value={`${job.daysInStage}d`} />
            {job.blockingIssue && (
              <div className="mt-2 text-[11px] text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1.5">
                ⚠ {job.blockingIssue}
              </div>
            )}
          </Section>

          {/* Job Info */}
          <Section title="Job Info">
            <Row label="Type" value={DOCK_TYPE_LABEL[job.dockType]} />
            {job.scopeSummary && (
              <div className="mt-1.5 text-[12px] text-muted-foreground italic leading-snug">
                {job.scopeSummary}
              </div>
            )}
          </Section>

          {/* Financials */}
          <Section title="Financials">
            <Row
              label="Contract"
              value={job.contractAmount > 0
                ? `$${job.contractAmount.toLocaleString()}`
                : "TBD"}
            />
            <Row label="Deposit" value={
              <span className={job.depositReceived ? "text-green-600 font-semibold" : "text-amber-600"}>
                {job.depositReceived ? "Received" : "Pending"}
              </span>
            } />
          </Section>

          {/* Schedule */}
          <Section title="Schedule">
            <Row label="Start" value={job.scheduledStart ?? "TBD"} />
            <Row label="Est. Completion" value={job.estCompletion ?? "TBD"} />
            <Row label="Crew" value={job.assignedCrew ?? "Unassigned"} />
          </Section>

          {/* Permit block — always shown, visually prominent when permitting */}
          <Section title="Permit">
            {!job.permitRequired ? (
              <div className="text-[12px] text-muted-foreground">No permit required for this job.</div>
            ) : (
              <>
                {/* Urgency banner when actively in permitting stage */}
                {job.stage === "permitting" && (
                  <div className={`rounded-md px-3 py-2 mb-3 text-[12px] font-semibold ${URGENCY_STYLE[urgency]}`}>
                    {urgency === "overdue" && "⚠ Permit action OVERDUE — immediate follow-up required"}
                    {urgency === "due_soon" && "⏱ Permit deadline approaching — follow up this week"}
                    {urgency === "ok" && "✓ Permit on track"}
                  </div>
                )}
                <Row label="Agency" value={job.permitAgency} />
                <Row label="Status" value={
                  <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold
                    ${ job.permitStatus === "approved" ? "bg-green-100 text-green-700" :
                       job.permitStatus === "expired"  ? "bg-red-100 text-red-700" :
                       "bg-blue-100 text-blue-700" }`}>
                    {PERMIT_STATUS_LABEL[job.permitStatus]}
                  </span>
                } />
                <Row label="Submitted" value={job.permitSubmittedDate ?? "Not yet"} />
                <Row label="Target Date" value={
                  <span className={urgency === "overdue" ? "text-red-600 font-semibold" : urgency === "due_soon" ? "text-amber-600 font-semibold" : ""}>
                    {job.permitTargetDate ?? "—"}
                  </span>
                } />
                {job.permitNotes && (
                  <div className="mt-2 text-[11px] text-muted-foreground leading-snug bg-muted rounded px-2 py-1.5">
                    {job.permitNotes}
                  </div>
                )}
              </>
            )}
          </Section>

          {/* Notes */}
          {job.jobNotes && (
            <Section title="Notes">
              <div className="text-[12px] text-muted-foreground leading-relaxed">
                {job.jobNotes}
              </div>
            </Section>
          )}

        </div>
      </div>
    </>
  );
}
