import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PERMITS, PROJECTS } from "@/data/seed";
import { PERMIT_STATUS_LABEL, PermitStatus } from "@/data/types";
import { fmtDate, fmtRelative, dollars } from "@/data/selectors";
import { StatusBadge, Pill, StatCard, SectionHeader } from "@/components/ui-kit";
import { FileWarning, AlertTriangle } from "lucide-react";

const STATUS_KIND: Record<PermitStatus, "track" | "watch" | "risk" | "neutral" | "info"> = {
  not_required: "neutral",
  drafting: "info",
  submitted: "info",
  in_review: "watch",
  rfi: "watch",
  revisions: "risk",
  approved: "track",
  expired: "risk",
};

export default function Permits() {
  const [status, setStatus] = useState<"all" | PermitStatus>("all");

  const enriched = useMemo(() => {
    return PERMITS
      .map((p) => ({
        permit: p,
        project: PROJECTS.find((x) => x.id === p.projectId)!,
      }))
      .filter((row) => status === "all" ? true : row.permit.status === status);
  }, [status]);

  const open = PERMITS.filter((p) => p.status !== "approved" && p.status !== "not_required");
  const stuck = open.filter((p) => p.ageDays > 14);
  const inRevisions = PERMITS.filter((p) => p.status === "revisions").length;
  const dueWeek = PERMITS.filter(
    (p) => p.revisionDueDate && new Date(p.revisionDueDate).getTime() - Date.now() < 7 * 86400000,
  ).length;

  return (
    <AppShell
      title="Permitting Tracker"
      subtitle="Operational queue across municipalities, USACE, FL DEP, HOA · prioritized by aging"
    >
      <div className="px-6 py-6 space-y-5 max-w-[1500px] mx-auto">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Open Permits" value={open.length} sub={`${PERMITS.length} total tracked`} />
          <StatCard label="Stuck (>14d)" value={stuck.length} sub="Need escalation" accent={stuck.length ? "warn" : "default"} icon={<AlertTriangle className="w-4 h-4" />} />
          <StatCard label="In Revisions" value={inRevisions} sub="Drawings in flux" accent={inRevisions ? "bad" : "default"} />
          <StatCard label="Due This Week" value={dueWeek} sub="Revision deadlines" />
        </section>

        <section className="bg-card border border-card-border rounded-lg p-5">
          <SectionHeader
            title={<span className="flex items-center gap-2"><FileWarning className="w-3.5 h-3.5 text-[hsl(38_92%_62%)]" />Permit queue</span>}
            hint={`${enriched.length} record${enriched.length === 1 ? "" : "s"}`}
            action={
              <div className="flex items-center gap-2">
                <Chip label="All" active={status === "all"} onClick={() => setStatus("all")} />
                <Chip label="Drafting" active={status === "drafting"} onClick={() => setStatus("drafting")} />
                <Chip label="In Review" active={status === "in_review"} onClick={() => setStatus("in_review")} />
                <Chip label="Revisions" active={status === "revisions"} onClick={() => setStatus("revisions")} />
                <Chip label="Approved" active={status === "approved"} onClick={() => setStatus("approved")} />
              </div>
            }
          />

          <div className="overflow-x-auto scroll-contain">
            <table className="w-full text-[12.5px] min-w-[1100px]">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground border-b border-border">
                  <th className="py-2.5 font-medium">Job</th>
                  <th className="py-2.5 font-medium">Jurisdiction · Agency</th>
                  <th className="py-2.5 font-medium">Type</th>
                  <th className="py-2.5 font-medium">Drawings</th>
                  <th className="py-2.5 font-medium">Eng.</th>
                  <th className="py-2.5 font-medium">Submitted</th>
                  <th className="py-2.5 font-medium">Status</th>
                  <th className="py-2.5 font-medium">Reviewer</th>
                  <th className="py-2.5 font-medium">Revision Due</th>
                  <th className="py-2.5 font-medium">Approval Target</th>
                  <th className="py-2.5 font-medium text-right">Aging</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enriched.length === 0 ? (
                  <tr><td colSpan={11} className="py-8 text-center text-muted-foreground">No permits match this filter.</td></tr>
                ) : enriched
                  .sort((a, b) => b.permit.ageDays - a.permit.ageDays)
                  .map(({ permit, project }) => {
                    const stuck = permit.ageDays > 14 && permit.status !== "approved";
                    return (
                      <tr key={permit.id} className="hover-elevate align-top" data-testid={`row-permit-${permit.id}`}>
                        <td className="py-3">
                          <div className="font-semibold num-display">{project?.jobNumber}</div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">{project?.customer}</div>
                        </td>
                        <td className="py-3">
                          <div>{permit.jurisdiction}</div>
                          <div><Pill>{permit.agency}</Pill></div>
                        </td>
                        <td className="py-3">{permit.permitType}</td>
                        <td className="py-3">{permit.drawingsNeeded ? "Yes" : "—"}</td>
                        <td className="py-3">{permit.engineeringNeeded ? "Yes" : "—"}</td>
                        <td className="py-3 num-display">{fmtDate(permit.submissionDate)}</td>
                        <td className="py-3">
                          <StatusBadge kind={STATUS_KIND[permit.status]}>
                            {PERMIT_STATUS_LABEL[permit.status]}
                          </StatusBadge>
                        </td>
                        <td className="py-3 text-muted-foreground max-w-[260px]">
                          <span className="block truncate">{permit.reviewerComments || "—"}</span>
                        </td>
                        <td className="py-3 num-display">{fmtRelative(permit.revisionDueDate)}</td>
                        <td className="py-3 num-display">{fmtRelative(permit.approvalTargetDate)}</td>
                        <td className={`py-3 text-right num-display ${stuck ? "text-[hsl(38_92%_62%)]" : ""}`}>
                          {permit.ageDays}d
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      data-testid={`filter-permit-${label.toLowerCase().replace(/ /g, "-")}`}
      className={`
        h-7 px-2.5 text-[11px] font-medium rounded-md border transition-colors hover-elevate
        ${active
          ? "bg-primary/15 border-primary/40 text-primary"
          : "bg-card border-border text-muted-foreground"}
      `}
    >
      {label}
    </button>
  );
}
