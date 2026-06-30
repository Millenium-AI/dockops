import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { JobDrawer } from "@/components/JobDrawer";
import { CUSTOMERS, JOBS } from "@/data/seed";
import type { Customer, Job } from "@/data/types";
import { DOCK_TYPE_LABEL, JOB_STAGES } from "@/data/types";
import {
  Search, Phone, Mail, MapPin, ChevronDown, ChevronRight,
  ExternalLink, PlusCircle,
} from "lucide-react";

// ── helpers ─────────────────────────────────────────────────────────
const HEALTH_COLOR: Record<string, string> = {
  on_track: "bg-green-500",
  watch:    "bg-amber-400",
  at_risk:  "bg-red-500",
};

const STAGE_LABEL = Object.fromEntries(JOB_STAGES.map(s => [s.id, s.label]));

function dollars(n: number) {
  return n > 0 ? `$${(n / 1000).toFixed(0)}k` : "TBD";
}

// ── CustomerRow ──────────────────────────────────────────────────────
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

  return (
    <>
      {/* Customer header row */}
      <tr
        className="hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Expand toggle */}
        <td className="pl-4 pr-2 py-3 w-6">
          {jobs.length > 0
            ? expanded
              ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            : <span className="w-3.5 h-3.5 block" />
          }
        </td>

        {/* Name + contact */}
        <td className="py-3 pr-4">
          <div className="text-[13px] font-semibold">{customer.name}</div>
          <div className="flex items-center gap-3 mt-0.5">
            <a href={`mailto:${customer.email}`} onClick={e => e.stopPropagation()}
              className="text-[10.5px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              <Mail className="w-3 h-3" />{customer.email}
            </a>
            <a href={`tel:${customer.phone}`} onClick={e => e.stopPropagation()}
              className="text-[10.5px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              <Phone className="w-3 h-3" />{customer.phone}
            </a>
          </div>
        </td>

        {/* Location */}
        <td className="py-3 pr-4">
          <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />{customer.city}
          </div>
          <div className="text-[10.5px] text-muted-foreground/70 mt-0.5">{customer.address}</div>
        </td>

        {/* Source */}
        <td className="py-3 pr-4">
          {customer.source && (
            <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded">
              {customer.source}
            </span>
          )}
        </td>

        {/* Jobs summary */}
        <td className="py-3 pr-4">
          <div className="flex items-center gap-2">
            {openJobs.length > 0 && (
              <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                {openJobs.length} open
              </span>
            )}
            {closedJobs.length > 0 && (
              <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {closedJobs.length} closed
              </span>
            )}
            {jobs.length === 0 && (
              <span className="text-[11px] text-muted-foreground/60">No jobs yet</span>
            )}
          </div>
        </td>

        {/* Total value */}
        <td className="py-3 pr-4 text-right">
          <span className="text-[12px] font-semibold num-display">{dollars(totalValue)}</span>
        </td>

        {/* QB placeholder action */}
        <td className="py-3 pl-2 pr-4 text-right">
          <button
            onClick={e => { e.stopPropagation(); alert("QuickBooks sync coming soon"); }}
            className="inline-flex items-center gap-1 text-[10.5px] text-muted-foreground/60 hover:text-primary transition-colors"
            title="Sync to QuickBooks (coming soon)"
          >
            <ExternalLink className="w-3 h-3" />
            QB
          </button>
        </td>
      </tr>

      {/* Expanded job sub-rows */}
      {expanded && jobs.map(job => (
        <tr
          key={job.id}
          onClick={() => onSelectJob(job)}
          className="bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
        >
          <td className="pl-4 pr-2" />
          <td colSpan={2} className="py-2 pr-4">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${HEALTH_COLOR[job.health]}`} />
              <span className="text-[11px] font-mono text-muted-foreground">{job.jobNumber}</span>
              <span className="text-[12px] font-medium">{job.scopeSummary}</span>
            </div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5 pl-3.5">
              {DOCK_TYPE_LABEL[job.dockType]} &middot; {job.city}
            </div>
          </td>
          <td className="py-2 pr-4">
            <span className="text-[11px] bg-muted px-2 py-0.5 rounded">
              {STAGE_LABEL[job.stage]}
            </span>
          </td>
          <td className="py-2 pr-4">
            {job.assignedCrew
              ? <span className="text-[11px] text-muted-foreground">{job.assignedCrew}</span>
              : <span className="text-[11px] text-muted-foreground/50">Unassigned</span>}
          </td>
          <td className="py-2 pr-4 text-right">
            <span className="text-[11px] num-display">{dollars(job.contractAmount)}</span>
          </td>
          <td className="py-2 pl-2 pr-4 text-right">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function Customers() {
  const [query, setQuery]   = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Map customer → jobs
  const jobsByCustomer = useMemo(() => {
    const map: Record<string, Job[]> = {};
    for (const job of JOBS) {
      (map[job.customerId] ??= []).push(job);
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    if (!query) return CUSTOMERS;
    const q = query.toLowerCase();
    return CUSTOMERS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.source ?? "").toLowerCase().includes(q)
    );
  }, [query]);

  // Stats
  const totalRevenue = JOBS.reduce((s, j) => s + j.contractAmount, 0);
  const openCount    = JOBS.filter(j => j.stage !== "closed").length;

  return (
    <AppShell title="Customers">
      <div className="px-5 py-4 space-y-4 max-w-[1500px] mx-auto">

        {/* Stat strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Customers",    value: CUSTOMERS.length },
            { label: "Open Jobs",    value: openCount },
            { label: "Total Value",  value: `$${(totalRevenue / 1000).toFixed(0)}k` },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-lg px-4 py-3">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
              <div className="text-[22px] font-bold num-display mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search + Add */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-[360px]">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, city, source…"
              className="w-full h-8 pl-8 pr-3 text-[12.5px] rounded-md border border-border bg-card placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60"
            />
          </div>
          <button
            className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-card text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => alert("New customer form — coming soon")}
          >
            <PlusCircle className="w-3.5 h-3.5" /> New Customer
          </button>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead className="border-b border-border">
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="pl-4 pr-2 py-3 w-6" />
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Location</th>
                <th className="py-3 pr-4 font-medium">Source</th>
                <th className="py-3 pr-4 font-medium">Jobs</th>
                <th className="py-3 pr-4 font-medium text-right">Value</th>
                <th className="py-3 pl-2 pr-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[12px] text-muted-foreground">
                    No customers match.
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

        <p className="text-[10.5px] text-muted-foreground/50">
          Click a customer to expand jobs &middot; Click a job row to open the detail drawer
          &middot; <span className="italic">QB sync coming in a future sprint</span>
        </p>
      </div>

      <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />
    </AppShell>
  );
}
