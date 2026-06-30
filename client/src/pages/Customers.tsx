import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { JobDrawer } from "@/components/JobDrawer";
import { CUSTOMERS, JOBS } from "@/data/seed";
import type { Customer, Job } from "@/data/types";
import { DOCK_TYPE_LABEL, JOB_STAGES } from "@/data/types";
import {
  Search, Phone, Mail, MapPin, ChevronDown, ChevronRight,
  ExternalLink, PlusCircle, Users, Briefcase, TrendingUp, CheckCircle2, DollarSign,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────
const HEALTH_COLOR: Record<string, string> = {
  on_track: "bg-green-500",
  watch:    "bg-amber-400",
  at_risk:  "bg-red-500",
};

const STAGE_LABEL = Object.fromEntries(JOB_STAGES.map(s => [s.id, s.label]));

function dollars(n: number) {
  return n > 0 ? `$${(n / 1000).toFixed(0)}k` : "TBD";
}

function getInitials(name: string) {
  const parts = name.split(" ");
  return (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "");
}

const AVATAR_HUES = [
  "bg-teal-900 text-teal-300",
  "bg-blue-900 text-blue-300",
  "bg-slate-700 text-slate-300",
  "bg-violet-900 text-violet-300",
  "bg-amber-900 text-amber-300",
];

function avatarClass(name: string) {
  return AVATAR_HUES[name.charCodeAt(0) % 5];
}

function fmtMonthDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getTags(jobs: Job[]) {
  const tags: { label: string; className: string }[] = [];
  const closedJobs = jobs.filter(j => j.stage === "closed");
  const openJobs = jobs.filter(j => j.stage !== "closed");
  if (closedJobs.length > 1) tags.push({ label: "Repeat", className: "status-neutral" });
  if (openJobs.length > 0) tags.push({ label: "Active", className: "status-track" });
  if (jobs.length === 1 && (jobs[0].stage === "lead" || jobs[0].stage === "estimating")) {
    tags.push({ label: "New", className: "status-info" });
  }
  return tags;
}

// ── CustomerRow ──────────────────────────────────────────────────────────
interface RowProps {
  customer: Customer;
  jobs: Job[];
  onSelectJob: (job: Job) => void;
}

function CustomerRow({ customer, jobs, onSelectJob }: RowProps) {
  const [expanded, setExpanded] = useState(false);

  const openJobs   = jobs.filter(j => j.stage !== "closed");
  const closedJobs = jobs.filter(j => j.stage === "closed");
  const totalValue = jobs.reduce((s, j) => s + j.contractAmount, 0);
  const tags = getTags(jobs);

  const lastJobDate = jobs.length > 0
    ? [...jobs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].updatedAt
    : null;

  return (
    <>
      {/* Customer header row */}
      <tr
        className="group hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Expand toggle */}
        <td className="pl-4 pr-2 py-3 w-8">
          {jobs.length > 0
            ? expanded
              ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            : <span className="w-3.5 h-3.5 block" />
          }
        </td>

        {/* Name + avatar */}
        <td className="py-3 pr-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarClass(customer.name)}`}>
              {getInitials(customer.name)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold inline truncate">{customer.name}</div>
              {customer.source && (
                <span className="inline ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded">
                  {customer.source}
                </span>
              )}
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <a href={`mailto:${customer.email}`} onClick={e => e.stopPropagation()}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                  <Mail className="w-3 h-3" />{customer.email}
                </a>
                <a href={`tel:${customer.phone}`} onClick={e => e.stopPropagation()}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                  <Phone className="w-3 h-3" />{customer.phone}
                </a>
              </div>
            </div>
          </div>
        </td>

        {/* Location */}
        <td className="py-3 pr-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground truncate">
            <MapPin className="w-3 h-3 shrink-0" />{customer.city}
          </div>
        </td>

        {/* Last Job */}
        <td className="py-3 pr-4 text-sm text-muted-foreground/50 whitespace-nowrap">
          {lastJobDate ? fmtMonthDay(lastJobDate) : "No jobs"}
        </td>

        {/* Tags */}
        <td className="py-3 pr-4">
          <div className="flex gap-1 flex-wrap">
            {tags.map(t => (
              <span key={t.label} className={`text-xs px-2 py-0.5 rounded ${t.className}`}>
                {t.label}
              </span>
            ))}
          </div>
        </td>

        {/* Jobs summary */}
        <td className="py-3 pr-4">
          <div className="flex items-center gap-2 flex-wrap">
            {openJobs.length > 0 && (
              <span className="text-xs font-semibold text-emerald-300 bg-emerald-950 border border-emerald-800 px-1.5 py-0.5 rounded">
                {openJobs.length} open
              </span>
            )}
            {closedJobs.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {closedJobs.length} closed
              </span>
            )}
            {jobs.length === 0 && (
              <span className="text-xs text-muted-foreground/60">No jobs yet</span>
            )}
          </div>
        </td>

        {/* Total value */}
        <td className="py-3 pr-4 text-right whitespace-nowrap">
          <span className="text-sm font-semibold num-display">{dollars(totalValue)}</span>
        </td>

        {/* Quick Actions */}
        <td className="py-3 pl-2 pr-4 text-right w-[10%]">
          <div className="hidden group-hover:flex items-center justify-end gap-2">
            <a href={`mailto:${customer.email}`} onClick={e => e.stopPropagation()}
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Email">
              <Mail className="w-3.5 h-3.5" />
            </a>
            <a href={`tel:${customer.phone}`} onClick={e => e.stopPropagation()}
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Call">
              <Phone className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={e => { e.stopPropagation(); alert("New Job form — coming soon"); }}
              className="text-muted-foreground hover:text-primary transition-colors"
              title="New Job">
              <PlusCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); alert("QuickBooks sync coming soon"); }}
              className="text-muted-foreground hover:text-primary transition-colors"
              title="QB Sync">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded job sub-rows */}
      {expanded && jobs.map(job => {
        const statusClass = job.health === "at_risk" ? "status-risk" :
          job.health === "watch" ? "status-watch" :
          job.stage === "closed" ? "status-neutral" : "status-track";
        return (
          <tr
            key={job.id}
            onClick={() => onSelectJob(job)}
            className="bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <td className="pl-4 pr-2" />
            <td colSpan={2} className="py-2 pr-4">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${HEALTH_COLOR[job.health]}`} />
                <span className="text-xs font-mono text-muted-foreground">{job.jobNumber}</span>
                <span className="text-sm font-medium">{job.scopeSummary}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 pl-3.5">
                {DOCK_TYPE_LABEL[job.dockType]} &middot; {job.city}
              </div>
            </td>
            <td className="py-2 pr-4">
              <span className={`text-xs px-2 py-0.5 rounded ${statusClass}`}>
                {STAGE_LABEL[job.stage]}
              </span>
            </td>
            <td className="py-2 pr-4" />
            <td className="py-2 pr-4">
              {job.assignedCrew
                ? <span className="text-xs text-muted-foreground">{job.assignedCrew}</span>
                : <span className="text-xs text-muted-foreground/50">Unassigned</span>}
            </td>
            <td className="py-2 pr-4 text-right">
              <span className="text-xs num-display">{dollars(job.contractAmount)}</span>
            </td>
            <td className="py-2 pl-2 pr-4 text-right">
              <button
                onClick={e => { e.stopPropagation(); onSelectJob(job); }}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                Open Job
              </button>
            </td>
          </tr>
        );
      })}
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function Customers() {
  const [query, setQuery]   = useState("");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [sortBy, setSortBy] = useState("Name A–Z");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Map customer → jobs
  const jobsByCustomer = useMemo(() => {
    const map: Record<string, Job[]> = {};
    for (const job of JOBS) {
      (map[job.customerId] ??= []).push(job);
    }
    return map;
  }, []);

  const uniqueSources = useMemo(() => {
    const sources = new Set(CUSTOMERS.map(c => c.source).filter(Boolean));
    return ["All Sources", ...Array.from(sources).sort()];
  }, []);

  const filtered = useMemo(() => {
    let result = [...CUSTOMERS];

    // Search filter
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.source ?? "").toLowerCase().includes(q)
      );
    }

    // Source filter
    if (sourceFilter !== "All Sources") {
      result = result.filter(c => c.source === sourceFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "Name A–Z": return a.name.localeCompare(b.name);
        case "Name Z–A": return b.name.localeCompare(a.name);
        case "Most Jobs":
          return (jobsByCustomer[b.id]?.length ?? 0) - (jobsByCustomer[a.id]?.length ?? 0);
        case "Highest Value": {
          const va = (jobsByCustomer[a.id] ?? []).reduce((s, j) => s + j.contractAmount, 0);
          const vb = (jobsByCustomer[b.id] ?? []).reduce((s, j) => s + j.contractAmount, 0);
          return vb - va;
        }
        case "Most Recent": {
          const da = jobsByCustomer[a.id]?.length
            ? Math.max(...jobsByCustomer[a.id].map(j => new Date(j.updatedAt).getTime()))
            : 0;
          const db = jobsByCustomer[b.id]?.length
            ? Math.max(...jobsByCustomer[b.id].map(j => new Date(j.updatedAt).getTime()))
            : 0;
          return db - da;
        }
        default: return 0;
      }
    });

    return result;
  }, [query, sourceFilter, sortBy, jobsByCustomer]);

  // Stats
  const totalRevenue = JOBS.reduce((s, j) => s + j.contractAmount, 0);
  const openCount    = JOBS.filter(j => j.stage !== "closed").length;
  const pipelineValue = JOBS.filter(j => j.stage !== "closed").reduce((s, j) => s + j.contractAmount, 0);
  const closedRevenue = JOBS.filter(j => j.stage === "closed").reduce((s, j) => s + j.contractAmount, 0);
  const avgJobValue = JOBS.length > 0 ? totalRevenue / JOBS.length : 0;

  const stats = [
    { label: "Total Customers", value: CUSTOMERS.length, icon: Users },
    { label: "Active Jobs",    value: openCount,       icon: Briefcase, color: "text-primary" },
    { label: "Pipeline Value", value: `$${(pipelineValue / 1000).toFixed(0)}k`, icon: TrendingUp },
    { label: "Closed Revenue", value: `$${(closedRevenue / 1000).toFixed(0)}k`, icon: CheckCircle2 },
    { label: "Avg Job Value",  value: `$${(avgJobValue / 1000).toFixed(0)}k`, icon: DollarSign },
  ];

  return (
    <AppShell title="Customers">
      <div className="space-y-4 w-full">

        {/* Stat strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
          {stats.map(s => (
            <div key={s.label} className="bg-card border border-border rounded-lg px-4 py-3 w-full">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
                <s.icon className={`w-4 h-4 text-muted-foreground ${s.color ?? ""}`} />
              </div>
              <div className="text-2xl font-bold num-display mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search + filter + Add */}
        <div className="flex items-center gap-3 flex-wrap w-full">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, city, source…"
              className="w-full h-8 pl-8 pr-3 text-sm rounded-md border border-border bg-card placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60"
            />
          </div>
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="h-8 px-2 text-sm rounded-md border border-border bg-card focus:outline-none focus:border-primary/60 shrink-0"
          >
            {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="h-8 px-2 text-sm rounded-md border border-border bg-card focus:outline-none focus:border-primary/60 shrink-0"
          >
            <option>Name A–Z</option>
            <option>Name Z–A</option>
            <option>Most Jobs</option>
            <option>Highest Value</option>
            <option>Most Recent</option>
          </select>
          <button
            className="ml-auto shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => alert("New customer form — coming soon")}
          >
            <PlusCircle className="w-3.5 h-3.5" /> New Customer
          </button>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden w-full">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-8" />
              <col className="w-[30%]" />
              <col className="w-[10%]" />
              <col className="w-[8%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[8%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead className="border-b border-border">
              <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="pl-4 pr-2 py-3 w-8" />
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Location</th>
                <th className="py-3 pr-4 font-medium">Last Job</th>
                <th className="py-3 pr-4 font-medium">Tags</th>
                <th className="py-3 pr-4 font-medium">Jobs</th>
                <th className="py-3 pr-4 font-medium text-right">Value</th>
                <th className="py-3 pl-2 pr-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <div className="text-sm font-medium text-muted-foreground">No customers found</div>
                    <div className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filters</div>
                  </td>
                </tr>
              ) : filtered.map(c => (
                <CustomerRow
                  key={c.id}
                  customer={c}
                  jobs={jobsByCustomer[c.id] ?? []}
                  onSelectJob={setSelectedJob}
                />
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground/50">
          Click a customer to expand jobs &middot; Click a job row to open the detail drawer
          &middot; <span className="italic">QB sync coming in a future sprint</span>
        </p>
      </div>

      <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />
    </AppShell>
  );
}
