import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { JobCard } from "@/components/JobCard";
import { JobDrawer } from "@/components/JobDrawer";
import { JOBS } from "@/data/seed";
import { JOB_STAGES, type Job, type JobStage } from "@/data/types";
import { AlertTriangle } from "lucide-react";

// Column header color accents
const STAGE_ACCENT: Record<JobStage, string> = {
  lead:        "border-t-slate-400",
  estimating:  "border-t-blue-400",
  contracted:  "border-t-violet-400",
  permitting:  "border-t-amber-400",
  in_progress: "border-t-green-500",
  closed:      "border-t-gray-400",
};

const STAGE_COUNT_COLOR: Record<JobStage, string> = {
  lead:        "bg-slate-100 text-slate-600",
  estimating:  "bg-blue-100 text-blue-700",
  contracted:  "bg-violet-100 text-violet-700",
  permitting:  "bg-amber-100 text-amber-700",
  in_progress: "bg-green-100 text-green-700",
  closed:      "bg-gray-100 text-gray-600",
};

export default function Board() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Group jobs by stage
  const byStage = JOB_STAGES.reduce<Record<JobStage, Job[]>>((acc, s) => {
    acc[s.id] = JOBS.filter(j => j.stage === s.id);
    return acc;
  }, {} as Record<JobStage, Job[]>);

  // Count permitting jobs that need attention for the header alert
  const permitAlerts = JOBS.filter(
    j => j.stage === "permitting" &&
    ["overdue", "due_soon"].includes(
      j.permitTargetDate
        ? Math.ceil((new Date(j.permitTargetDate).getTime() - Date.now()) / 86_400_000) <= 7
          ? "due_soon"
          : "ok"
        : "ok"
    ) ||
    (j.stage === "permitting" && j.permitTargetDate &&
      new Date(j.permitTargetDate) < new Date())
  ).length;

  return (
    <AppShell title="Job Board">
      <div className="flex flex-col h-full">

        {/* Permit alert banner */}
        {permitAlerts > 0 && (
          <div className="mx-4 mt-3 mb-1 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-[13px] text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <span className="font-semibold">{permitAlerts} permit{permitAlerts > 1 ? "s" : ""}</span>
              {" "}need{permitAlerts === 1 ? "s" : ""} attention — check the Permitting column.
            </span>
          </div>
        )}

        {/* Kanban board */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-3 px-4 py-4 h-full" style={{ minWidth: `${JOB_STAGES.length * 240}px` }}>
            {JOB_STAGES.map(stage => {
              const jobs = byStage[stage.id];
              return (
                <div
                  key={stage.id}
                  className={`flex flex-col w-[240px] shrink-0 bg-muted/40 rounded-xl border-t-2 ${STAGE_ACCENT[stage.id]}`}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-[13px] font-semibold">{stage.label}</span>
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${STAGE_COUNT_COLOR[stage.id]}`}>
                      {jobs.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-2 px-2 pb-3 overflow-y-auto flex-1">
                    {jobs.length === 0 && (
                      <div className="text-[11px] text-muted-foreground/50 text-center py-6">
                        No jobs
                      </div>
                    )}
                    {jobs.map(job => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onClick={setSelectedJob}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Job detail drawer */}
      <JobDrawer
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </AppShell>
  );
}
