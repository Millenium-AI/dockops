import { AppShell } from "@/components/AppShell";
import { JOBS } from "@/data/seed";
import { DollarSign, AlertCircle, Clock } from "lucide-react";

export default function Reporting() {
  const activeJobs = JOBS.filter(j => j.status !== "completed");
  const totalOwed = activeJobs.reduce((sum, j) => sum + j.amountOwed, 0);
  const completedValue = JOBS.filter(j => j.status === "completed").reduce((sum, j) => sum + j.amountOwed, 0);

  // Group by crew
  const byCrew = activeJobs.reduce<Record<string, typeof activeJobs>>((acc, job) => {
    const crew = job.assignedCrew || "Unassigned";
    if (!acc[crew]) acc[crew] = [];
    acc[crew].push(job);
    return acc;
  }, {});

  // Group by job type
  const byType = activeJobs.reduce<Record<string, typeof activeJobs>>((acc, job) => {
    if (!acc[job.jobType]) acc[job.jobType] = [];
    acc[job.jobType].push(job);
    return acc;
  }, {});

  // Overdue (scheduled date passed)
  const overdue = activeJobs.filter(j => {
    if (!j.scheduledDate) return false;
    return new Date(j.scheduledDate) < new Date() && j.status !== "in_progress" && j.status !== "completed";
  });

  return (
    <AppShell title="Reports & Financials">
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <DollarSign className="w-4 h-4" />
              Outstanding Money
            </div>
            <div className="text-3xl font-bold">${(totalOwed / 1000).toFixed(1)}k</div>
            <div className="text-xs text-muted-foreground mt-2">{activeJobs.length} active jobs</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              Est. Workload
            </div>
            <div className="text-3xl font-bold">{activeJobs.reduce((sum, j) => sum + j.estimatedDays, 0)} days</div>
            <div className="text-xs text-muted-foreground mt-2">Across all active jobs</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <AlertCircle className="w-4 h-4" />
              Overdue
            </div>
            <div className="text-3xl font-bold">{overdue.length}</div>
            <div className="text-xs text-muted-foreground mt-2">Waiting to start</div>
          </div>
        </div>

        {/* Overdue jobs */}
        {overdue.length > 0 && (
          <div className="bg-red-500/10 border border-red-300 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-3">Overdue / Waiting to Start</h3>
            <div className="space-y-2">
              {overdue.map(job => (
                <div key={job.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{job.customerName} ({job.jobNumber})</div>
                    <div className="text-xs text-muted-foreground">
                      Scheduled: {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${job.amountOwed.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{job.estimatedDays}d</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By crew */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Outstanding by Crew</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(byCrew).map(([crew, jobs]) => {
              const crewOwed = jobs.reduce((sum, j) => sum + j.amountOwed, 0);
              const crewDays = jobs.reduce((sum, j) => sum + j.estimatedDays, 0);
              return (
                <div key={crew} className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{crew}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Outstanding:</span>
                      <span className="font-semibold">${(crewOwed / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Workload:</span>
                      <span className="font-semibold">{crewDays}d</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jobs:</span>
                      <span className="font-semibold">{jobs.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By job type */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Outstanding by Job Type</h3>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="space-y-0">
              {Object.entries(byType).map(([type, jobs], idx) => {
                const typeOwed = jobs.reduce((sum, j) => sum + j.amountOwed, 0);
                const typeDays = jobs.reduce((sum, j) => sum + j.estimatedDays, 0);
                return (
                  <div
                    key={type}
                    className={`px-4 py-3 flex items-center justify-between ${
                      idx < Object.keys(byType).length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div>
                      <div className="font-medium">{type}</div>
                      <div className="text-xs text-muted-foreground">{jobs.length} jobs</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${(typeOwed / 1000).toFixed(1)}k</div>
                      <div className="text-xs text-muted-foreground">{typeDays}d</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
