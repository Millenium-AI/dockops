import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { JobCard } from "@/components/JobCard";
import { JobDrawer } from "@/components/JobDrawer";
import { JOBS } from "@/data/seed";
import { JOB_STATUSES, type Job, type JobStatus } from "@/data/types";

const STATUS_ACCENT: Record<JobStatus, string> = {
  pending:      "border-t-slate-400",
  scheduled:    "border-t-blue-400",
  in_progress:  "border-t-green-500",
  completed:    "border-t-gray-400",
};

export default function Board() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const byStatus = JOB_STATUSES.reduce<Record<JobStatus, Job[]>>((acc, s) => {
    acc[s.id] = JOBS.filter(j => j.status === s.id);
    return acc;
  }, {} as Record<JobStatus, Job[]>);

  const totalOwed = JOBS.reduce((sum, j) => sum + j.amountOwed, 0);
  const activeJobs = JOBS.filter(j => j.status !== "completed").length;

  const stats = [
    { label: "Total Outstanding", value: `$${(totalOwed / 1000).toFixed(1)}k` },
    { label: "Active Jobs", value: activeJobs },
    { label: "Total Jobs", value: JOBS.length },
  ];

  return (
    <AppShell noPadding fluid title="Job Board">
      <div className="space-y-6 px-[clamp(1.5rem,3vw,2.5rem)] py-6">
        <div className="w-full bg-card border border-border rounded-lg px-6 py-4 flex">
          {stats.map((s, i) => (
            <div key={s.label} className={`flex-1 px-4 ${i < stats.length - 1 ? "border-r border-border" : ""}`}>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
              <div className="text-lg font-bold text-foreground mt-1">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-[clamp(1.5rem,3vw,2.5rem)] pb-[clamp(1rem,2vw,2rem)]">
        <div className="flex gap-[clamp(1rem,1.5vw,1.25rem)] w-full h-full">
          {JOB_STATUSES.map(status => {
            const jobs = byStatus[status.id];
            return (
              <div
                key={status.id}
                className={`flex flex-col flex-1 min-w-0 bg-muted/40 rounded-xl border-t-2 ${STATUS_ACCENT[status.id]}`}
              >
                <div className="flex items-center justify-between px-4 py-3.5 shrink-0">
                  <span className="text-sm font-semibold truncate">{status.label}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 bg-foreground/10">
                    {jobs.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3 px-3 pb-4 overflow-y-auto flex-1">
                  {jobs.length === 0 && (
                    <div className="text-xs text-muted-foreground/50 text-center py-8">No jobs</div>
                  )}
                  {jobs.map(job => (
                    <JobCard key={job.id} job={job} onClick={setSelectedJob} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />
    </AppShell>
  );
}
