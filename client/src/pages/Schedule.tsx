import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { JobDrawer } from "@/components/JobDrawer";
import { JOBS, NOW } from "@/data/seed";
import type { Job } from "@/data/types";
import { CalendarDays, List, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
};

const isToday = (iso: string) => new Date(iso).toDateString() === NOW.toDateString();
const isPast = (iso: string) => new Date(iso) < NOW;

function JobScheduleItem({ job, onClick }: { job: Job; onClick: (j: Job) => void }) {
  if (!job.scheduledDate) return null;

  return (
    <div
      onClick={() => onClick(job)}
      className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{job.customerName}</div>
        <div className="text-xs text-muted-foreground">{job.jobNumber}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-semibold text-sm">${(job.amountOwed / 1000).toFixed(0)}k</div>
        <div className="text-xs text-muted-foreground">{job.estimatedDays}d</div>
      </div>
    </div>
  );
}

function CalendarCell({ date, jobs, onClick }: { date: string; jobs: Job[]; onClick: (j: Job) => void }) {
  const today = isToday(date);
  const past = isPast(date) && !today;

  return (
    <div
      className={`
        min-h-[100px] rounded-lg border p-2 flex flex-col gap-1 transition-colors
        ${today ? "ring-1 ring-primary bg-primary/5" : past ? "border-border/50 bg-muted/20" : "border-border bg-background/40"}
      `}
    >
      <div className={`text-xs font-semibold ${today ? "text-primary" : past ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
        {new Date(date + "T12:00:00").getDate()}
        {today && <span className="ml-1 text-primary uppercase text-xs">Today</span>}
      </div>
      <div className="space-y-1">
        {jobs.map(job => (
          <div
            key={job.id}
            onClick={() => onClick(job)}
            className="text-xs p-1 rounded bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 truncate font-medium"
          >
            {job.customerName}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Schedule() {
  const [view, setView] = useState<"board" | "calendar" | "list">("board");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [crewFilter, setCrewFilter] = useState("all");
  const [weekOffset, setWeekOffset] = useState(0);

  // Only jobs with scheduled dates
  const scheduledJobs = useMemo(
    () => JOBS.filter(j => j.scheduledDate),
    []
  );

  // Filter by crew
  const filtered = useMemo(() => {
    return scheduledJobs.filter(j => {
      if (crewFilter !== "all" && j.assignedCrew !== crewFilter) return false;
      return true;
    });
  }, [crewFilter]);

  // Board view: 7 days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(NOW);
      d.setDate(d.getDate() + i + weekOffset * 7);
      return d.toISOString().slice(0, 10);
    });
  }, [weekOffset]);

  // Calendar view: 28 days
  const calDays = useMemo(() => {
    const monday = getMonday(NOW);
    monday.setDate(monday.getDate() + weekOffset * 7);
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [weekOffset]);

  // Group jobs by date
  const byDate = useMemo(() => {
    const map: Record<string, Job[]> = {};
    for (const job of filtered) {
      if (job.scheduledDate) {
        const k = job.scheduledDate.slice(0, 10);
        (map[k] ??= []).push(job);
      }
    }
    return map;
  }, [filtered]);

  const crews = ["all", ...new Set(scheduledJobs.map(j => j.assignedCrew || "Unassigned"))];

  return (
    <AppShell title="Schedule">
      <div className="space-y-3 w-full">
        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-card">
            {(["board", "calendar", "list"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`h-7 px-3 text-xs font-medium rounded-[3px] transition-colors flex items-center gap-1.5 ${
                  view === v ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "board" ? <LayoutGrid className="w-3.5 h-3.5" /> :
                 v === "calendar" ? <CalendarDays className="w-3.5 h-3.5" /> :
                 <List className="w-3.5 h-3.5" />}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset(o => o - 1)}
              className="h-7 w-7 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(o => o + 1)}
              className="h-7 w-7 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Select value={crewFilter} onValueChange={setCrewFilter}>
            <SelectTrigger className="h-8 w-[160px] text-sm bg-card border-border">
              <SelectValue placeholder="Filter crew" />
            </SelectTrigger>
            <SelectContent>
              {crews.map(c => (
                <SelectItem key={c} value={c}>{c === "all" ? "All Crews" : c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="ml-auto text-sm text-muted-foreground">{filtered.length} scheduled</span>
        </div>

        {/* Board view */}
        {view === "board" && (
          <div className="grid grid-cols-7 gap-2 w-full">
            {weekDays.map(date => (
              <div key={date} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className={`px-2 py-1.5 text-xs font-semibold text-center ${isToday(date) ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" })}
                </div>
                <div className="divide-y divide-border">
                  {(byDate[date] ?? []).length === 0 ? (
                    <div className="text-xs text-muted-foreground/50 text-center py-4">—</div>
                  ) : (
                    (byDate[date] ?? []).map(job => (
                      <JobScheduleItem key={job.id} job={job} onClick={setSelectedJob} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calendar view */}
        {view === "calendar" && (
          <div className="w-full">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <div key={d} className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-center">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: (new Date(calDays[0] + "T12:00:00").getDay() + 6) % 7 }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {calDays.map(date => (
                <CalendarCell key={date} date={date} jobs={byDate[date] ?? []} onClick={setSelectedJob} />
              ))}
            </div>
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No scheduled jobs</div>
            ) : (
              <div className="divide-y divide-border">
                {Object.entries(byDate)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, dayJobs]) => (
                    <div key={date}>
                      <div className="bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase sticky top-0 z-10">
                        {new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </div>
                      <div className="divide-y divide-border">
                        {dayJobs.map(job => (
                          <JobScheduleItem key={job.id} job={job} onClick={setSelectedJob} />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />
    </AppShell>
  );
}
