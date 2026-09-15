import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { JobCard } from "@/components/JobCard";
import { JobDrawer } from "@/components/JobDrawer";
import { JOBS } from "@/data/seed";
import { AREAS as AREA_CONFIG, type Job } from "@/data/types";

const AREA_COLOR: Record<string, string> = {
  NW:   "border-l-sky-500 bg-sky-50/20 dark:bg-sky-950/20",
  NE:   "border-l-blue-500 bg-blue-50/20 dark:bg-blue-950/20",
  SE:   "border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20",
  SW:   "border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/20",
  MARK: "border-l-fuchsia-500 bg-fuchsia-50/20 dark:bg-fuchsia-950/20",
};

export default function Board() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { byBarge, waiting } = useMemo(() => {
    const barges: Record<string, Job[]> = {};
    const unassigned: Job[] = [];

    JOBS.forEach(job => {
      if (!job.assignedBarge) {
        unassigned.push(job);
      } else {
        if (!barges[job.assignedBarge]) {
          barges[job.assignedBarge] = [];
        }
        barges[job.assignedBarge].push(job);
      }
    });

    return { byBarge: barges, waiting: unassigned };
  }, []);

  const bargeList = Object.keys(byBarge).sort();
  const totalOwed = JOBS.reduce((sum, j) => sum + j.amountOwed, 0);
  const assigned = JOBS.filter(j => j.assignedBarge).length;

  const stats = [
    { label: "Total Outstanding", value: `$${(totalOwed / 1000).toFixed(1)}k` },
    { label: "Assigned", value: assigned },
    { label: "Waiting", value: waiting.length },
  ];

  return (
    <AppShell noPadding fluid title="Barge Board">
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
          {/* Barge columns */}
          {bargeList.map(barge => {
            const jobs = byBarge[barge];
            return (
              <div
                key={barge}
                className="flex flex-col flex-1 min-w-0 bg-muted/40 rounded-xl border-t-2 border-t-blue-500"
              >
                <div className="flex items-center justify-between px-4 py-3.5 shrink-0">
                  <span className="text-sm font-semibold truncate">{barge}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 bg-blue-500/20 text-blue-700 dark:text-blue-300">
                    {jobs.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3 px-3 pb-4 overflow-y-auto flex-1">
                  {jobs.length === 0 && (
                    <div className="text-xs text-muted-foreground/50 text-center py-8">No jobs</div>
                  )}
                  {jobs.map(job => (
                    <div
                      key={job.id}
                      className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${AREA_COLOR[job.area || ""]}`}
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="font-medium text-sm">{job.customerName}</div>
                      <div className="text-xs text-muted-foreground mt-1">{job.jobNumber}</div>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-muted-foreground">{job.jobType}</span>
                        <span className="font-semibold">${(job.amountOwed / 1000).toFixed(0)}k</span>
                      </div>
                      {job.area && (
                        <div className="mt-2 text-xs font-medium text-primary">
                          {AREA_CONFIG.find(a => a.id === job.area)?.label}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Waiting for Permits */}
      {waiting.length > 0 && (
        <div className="border-t border-border bg-amber-50/50 dark:bg-amber-950/30 px-[clamp(1.5rem,3vw,2.5rem)] py-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Waiting for Permits</h2>
            <p className="text-sm text-muted-foreground">{waiting.length} jobs pending assignment</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {waiting.map(job => (
              <div
                key={job.id}
                className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${AREA_COLOR[job.area || ""]}`}
                onClick={() => setSelectedJob(job)}
              >
                <div className="font-medium text-sm">{job.customerName}</div>
                <div className="text-xs text-muted-foreground mt-1">{job.jobNumber}</div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-muted-foreground">{job.jobType}</span>
                  <span className="font-semibold">${(job.amountOwed / 1000).toFixed(0)}k</span>
                </div>
                {job.area && (
                  <div className="mt-2 text-xs font-medium text-primary">
                    {AREA_CONFIG.find(a => a.id === job.area)?.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />
    </AppShell>
  );
}
