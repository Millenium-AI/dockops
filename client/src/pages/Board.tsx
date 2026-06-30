import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { JobCard } from "@/components/JobCard";
import { JobDrawer } from "@/components/JobDrawer";
import { JOBS } from "@/data/seed";
import { JOB_STAGES, type Job, type JobStage } from "@/data/types";
import { AlertTriangle, X } from "lucide-react";

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
  lead:        "stage-count-lead",
  estimating:  "stage-count-estimating",
  contracted:  "stage-count-contracted",
  permitting:  "stage-count-permitting",
  in_progress: "stage-count-progress",
  closed:      "stage-count-closed",
};

export default function Board() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [dismissAlert, setDismissAlert] = useState(false);

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

  // Summary stats
  const totalJobs = JOBS.length;
  const activeJobs = JOBS.filter(j => j.stage !== "closed").length;
  const pipelineValue = JOBS.filter(j => j.stage !== "closed").reduce((s, j) => s + j.contractAmount, 0);
  const closedRevenue = JOBS.filter(j => j.stage === "closed").reduce((s, j) => s + j.contractAmount, 0);

  const stats = [
    { label: "Total Jobs", value: totalJobs },
    { label: "Active", value: activeJobs },
    { label: "Pipeline Value", value: `$${(pipelineValue / 1000).toFixed(0)}k` },
    { label: "Closed Revenue", value: `$${(closedRevenue / 1000).toFixed(0)}k` },
  ];

  const headerSlot = (
    <div className="space-y-2">
      {/* Permit alert banner */}
      {permitAlerts > 0 && !dismissAlert && (
        <div className="flex items-center gap-2 alert-due border rounded-lg px-4 py-2.5 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="flex-1">
            <span className="font-semibold">{permitAlerts} permit{permitAlerts > 1 ? "s" : ""}</span>
            {" "}need{permitAlerts === 1 ? "s" : ""} attention — check the Permitting column.
          </span>
          <button
            onClick={() => setDismissAlert(true)}
            className="text-amber-400 hover:text-amber-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary stat strip */}
      <div className="w-full bg-card border border-border rounded-lg px-[clamp(0.75rem,1.5vw,1.5rem)] py-3 flex">
        {stats.map((s, i) => (
          <div key={s.label} className={`flex-1 px-3 ${i < stats.length - 1 ? "border-r border-border" : ""}`}>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
            <div className="text-lg font-bold text-foreground num-display">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AppShell noPadding fluid title="Job Board" headerSlot={headerSlot}>
      <div className="flex flex-col h-full overflow-hidden">

        {/* Kanban board */}
        <div className="flex-1 overflow-hidden px-[clamp(1rem,2vw,2rem)] pb-[clamp(0.75rem,1.5vw,1.5rem)]">
          <div className="flex gap-[clamp(0.5rem,0.75vw,0.75rem)] w-full h-full">
            {JOB_STAGES.map(stage => {
              const jobs = byStage[stage.id];
              return (
                <div
                  key={stage.id}
                  className={`flex flex-col flex-1 min-w-0 bg-muted/40 rounded-xl border-t-2 ${STAGE_ACCENT[stage.id]}`}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between px-3 py-2.5 shrink-0">
                    <span className="text-sm font-semibold truncate">{stage.label}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-2 ${STAGE_COUNT_COLOR[stage.id]}`}>
                      {jobs.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-2 px-2 pb-3 overflow-y-auto flex-1">
                    {jobs.length === 0 && (
                      <div className="text-xs text-muted-foreground/50 text-center py-6">
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
