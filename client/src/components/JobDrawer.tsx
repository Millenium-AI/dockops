import { X, MapPin, DollarSign, Calendar, Users, FileText } from "lucide-react";
import type { Job } from "../data/types";
import { JOB_STATUSES } from "../data/types";

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

export function JobDrawer({ job, onClose }: Props) {
  if (!job) return null;

  const statusLabel = JOB_STATUSES.find(s => s.id === job.status)?.label ?? job.status;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-[420px] bg-background border-l border-border shadow-xl z-50 flex flex-col">
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border">
          <div>
            <div className="text-[11px] font-mono text-muted-foreground mb-0.5">{job.jobNumber}</div>
            <div className="text-[17px] font-bold leading-tight">{job.customerName}</div>
            <div className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />{job.address}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <Section title="Status">
            <Row label="Status" value={<span className="capitalize font-semibold">{statusLabel}</span>} />
            <Row label="Type" value={job.jobType} />
          </Section>

          <Section title="Contact">
            <Row label="Customer" value={job.customerName} />
            {job.customerPhone && <Row label="Phone" value={job.customerPhone} />}
          </Section>

          <Section title="Financials">
            <Row label="Amount Owed" value={`$${job.amountOwed.toLocaleString()}`} />
            <Row label="Est. Days" value={`${job.estimatedDays}d`} />
          </Section>

          <Section title="Schedule">
            <Row label="Scheduled" value={job.scheduledDate ? new Date(job.scheduledDate + "T12:00:00").toLocaleDateString() : "Not scheduled"} />
            <Row label="Est. Completion" value={job.estimatedCompletionDate ? new Date(job.estimatedCompletionDate + "T12:00:00").toLocaleDateString() : "TBD"} />
          </Section>

          <Section title="Crew">
            <Row label="Assigned" value={job.assignedCrew || "Unassigned"} />
          </Section>

          {job.notes && (
            <Section title="Notes">
              <div className="text-[12px] text-muted-foreground leading-relaxed">{job.notes}</div>
            </Section>
          )}
        </div>
      </div>
    </>
  );
}
