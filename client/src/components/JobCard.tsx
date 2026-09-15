import type { Job } from "../data/types";
import { DollarSign, Calendar } from "lucide-react";

interface Props {
  job: Job;
  onClick: (job: Job) => void;
}

export function JobCard({ job, onClick }: Props) {
  return (
    <div
      onClick={() => onClick(job)}
      className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-xs text-muted-foreground font-mono">{job.jobNumber}</span>
        {job.amountOwed > 0 && (
          <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground font-semibold">
            <DollarSign className="w-3 h-3" />${(job.amountOwed / 1000).toFixed(0)}k
          </span>
        )}
      </div>

      <div className="text-sm font-semibold leading-snug mb-1 group-hover:text-primary transition-colors truncate">
        {job.customerName}
      </div>

      {job.address && (
        <div className="text-xs text-muted-foreground mb-2 truncate">{job.address}</div>
      )}

      <div className="text-xs text-muted-foreground/70 space-y-1">
        {job.estimatedDays > 0 && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {job.estimatedDays}d estimate
          </div>
        )}
        {job.assignedCrew && <div>Crew: {job.assignedCrew}</div>}
      </div>

      {job.notes && <div className="text-xs text-muted-foreground/60 mt-2 italic truncate">{job.notes}</div>}
    </div>
  );
}
