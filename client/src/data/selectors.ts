import {
  LEADS, PROJECTS, PERMITS, INVOICES, SCHEDULE, CREWS, EQUIPMENT, NOW,
} from "./seed";
import type {
  Lead, Project, Permit, Invoice, AppAlert, ScheduleItem,
} from "./types";

export function todayISO() {
  return NOW.toISOString().slice(0, 10);
}

export function diffDays(iso: string | null | undefined): number {
  if (!iso) return 0;
  const a = new Date(iso).getTime();
  const b = NOW.getTime();
  return Math.round((a - b) / 86400000);
}

export function dollars(n: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact && Math.abs(n) >= 1000) {
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    return `$${Math.round(n / 1000)}k`;
  }
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}

export function fmtRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const days = diffDays(iso);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0 && days < 7) return `In ${days}d`;
  if (days < 0 && days > -14) return `${Math.abs(days)}d ago`;
  return fmtDate(iso);
}

// =====================================================================
// FINANCE DERIVED
// =====================================================================
export function getFinanceSnapshot() {
  const openLeads = LEADS.filter(
    (l) => l.stage !== "closed_won" && l.stage !== "closed_lost"
  );
  const pipelineValue = openLeads.reduce((s, l) => s + l.estimatedValue, 0);
  const weightedPipeline = openLeads.reduce(
    (s, l) => s + l.estimatedValue * (l.probability / 100), 0,
  );

  const activeProjects = PROJECTS.filter((p) => p.stage !== "closed");
  const soldBacklog = activeProjects.reduce(
    (s, p) => s + Math.max(0, p.contractAmount - p.actualCostToDate),
    0,
  );

  const depositsCollected = INVOICES
    .filter((i) => i.type === "deposit" && i.status === "paid")
    .reduce((s, i) => s + i.amount, 0);

  const outstandingDeposits = INVOICES
    .filter((i) => i.type === "deposit" && i.status !== "paid")
    .reduce((s, i) => s + i.amount, 0);

  const arOutstanding = INVOICES
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + i.amount, 0);

  const finalsUnpaid = INVOICES
    .filter((i) => i.type === "final" && i.status !== "paid")
    .reduce((s, i) => s + i.amount, 0);

  const changeOrderValue = INVOICES
    .filter((i) => i.type === "change_order")
    .reduce((s, i) => s + i.amount, 0);

  const jobsReadyToInvoice = PROJECTS.filter(
    (p) => p.stage === "punch_list" || p.stage === "final_inspection",
  ).length;

  // Win rate: closed_won / (closed_won + closed_lost)  (limited to recent)
  const closedWon = LEADS.filter((l) => l.stage === "closed_won").length;
  const closedLost = LEADS.filter((l) => l.stage === "closed_lost").length;
  const winRate = closedWon + closedLost === 0 ? 0 : (closedWon / (closedWon + closedLost)) * 100;

  // Avg job size from active+won projects
  const wonProjects = PROJECTS;
  const avgJobSize = wonProjects.length === 0
    ? 0
    : wonProjects.reduce((s, p) => s + p.contractAmount, 0) / wonProjects.length;

  // 30 / 60 / 90 forecast: progress + final invoices forecast based on forecastCompletion
  const fc30 = forecastBy(30);
  const fc60 = forecastBy(60);
  const fc90 = forecastBy(90);

  // Monthly pipeline = same as pipeline for demo
  const monthlyPipeline = pipelineValue;

  return {
    pipelineValue,
    weightedPipeline,
    monthlyPipeline,
    soldBacklog,
    depositsCollected,
    outstandingDeposits,
    arOutstanding,
    finalsUnpaid,
    changeOrderValue,
    jobsReadyToInvoice,
    winRate,
    avgJobSize,
    fc30, fc60, fc90,
  };
}

function forecastBy(days: number): number {
  return PROJECTS
    .filter((p) => {
      if (!p.forecastCompletion) return false;
      const d = diffDays(p.forecastCompletion);
      return d >= 0 && d <= days && p.stage !== "closed";
    })
    .reduce((s, p) => s + Math.max(0, p.contractAmount - p.actualCostToDate), 0);
}

// =====================================================================
// ALERTS / RULES ENGINE
// =====================================================================
export function getAlerts(): AppAlert[] {
  const out: AppAlert[] = [];

  // Sales: stale stage > 7d (open) or no follow-up scheduled
  for (const lead of LEADS) {
    if (lead.stage === "closed_won" || lead.stage === "closed_lost") continue;

    if (!lead.nextActionDate && lead.daysSinceContact >= 5) {
      out.push({
        id: `A-no-fu-${lead.id}`,
        severity: "warn",
        title: "No follow-up scheduled",
        detail: `${lead.customer} — ${lead.daysSinceContact}d since contact`,
        refType: "lead",
        refId: lead.id,
        daysOld: lead.daysSinceContact,
      });
    }

    if (lead.daysInStage >= 10 && lead.stage !== "follow_up") {
      out.push({
        id: `A-stale-${lead.id}`,
        severity: "warn",
        title: "Lead stalled in stage",
        detail: `${lead.customer} — ${lead.daysInStage}d in ${lead.stage.replace(/_/g, " ")}`,
        refType: "lead",
        refId: lead.id,
        daysOld: lead.daysInStage,
      });
    }
  }

  // Projects: no deposit on sold project
  for (const p of PROJECTS) {
    if (p.stage === "closed") continue;

    if (
      (p.depositStatus === "invoiced" || p.depositStatus === "not_invoiced") &&
      p.stage !== "sold_handoff"
    ) {
      out.push({
        id: `A-no-dep-${p.id}`,
        severity: "danger",
        title: "Sold project — deposit not received",
        detail: `${p.jobNumber} ${p.customer} (${p.depositStatus.replace(/_/g, " ")})`,
        refType: "project",
        refId: p.id,
      });
    }

    // Permit-approved but materials not ordered
    const permit = PERMITS.find((pr) => pr.projectId === p.id);
    if (permit?.status === "approved" && p.stage === "permit_approved") {
      const ageSinceApproval = diffDays(permit.approvalTargetDate || "");
      if (ageSinceApproval < -3) {
        out.push({
          id: `A-no-mat-${p.id}`,
          severity: "warn",
          title: "Permit approved, materials not ordered",
          detail: `${p.jobNumber} ${p.customer}`,
          refType: "project",
          refId: p.id,
        });
      }
    }

    // No crew & install in less than 14 days
    if (!p.crewId && p.scheduledStart) {
      const d = diffDays(p.scheduledStart);
      if (d >= 0 && d <= 21) {
        out.push({
          id: `A-no-crew-${p.id}`,
          severity: "warn",
          title: "No crew assigned",
          detail: `${p.jobNumber} ${p.customer} starts in ${d}d`,
          refType: "project",
          refId: p.id,
        });
      }
    }

    // Stuck in production stage
    if (
      ["permit_submitted", "permit_revisions", "materials_ordered", "framing", "decking"].includes(p.stage) &&
      p.daysInStage > 14
    ) {
      out.push({
        id: `A-stuck-${p.id}`,
        severity: "warn",
        title: "Project stuck in stage",
        detail: `${p.jobNumber} — ${p.daysInStage}d in ${p.stage.replace(/_/g, " ")}`,
        refType: "project",
        refId: p.id,
      });
    }

    // At-risk health
    if (p.health === "at_risk") {
      out.push({
        id: `A-risk-${p.id}`,
        severity: "danger",
        title: "Project at risk",
        detail: `${p.jobNumber} ${p.customer} — ${p.blockingIssue ?? "Flagged"}`,
        refType: "project",
        refId: p.id,
      });
    }
  }

  // Permits: submission incomplete (drafting > 5d)
  for (const pr of PERMITS) {
    if (pr.status === "drafting" && pr.ageDays > 5) {
      const proj = PROJECTS.find((p) => p.id === pr.projectId);
      out.push({
        id: `A-draft-${pr.id}`,
        severity: "warn",
        title: "Permit drafting overdue",
        detail: `${proj?.jobNumber} — ${pr.ageDays}d in drafting`,
        refType: "permit",
        refId: pr.id,
      });
    }
  }

  // Invoices overdue
  for (const inv of INVOICES) {
    if (inv.status === "overdue") {
      const proj = PROJECTS.find((p) => p.id === inv.projectId);
      out.push({
        id: `A-inv-${inv.id}`,
        severity: "danger",
        title: inv.type === "final" ? "Final invoice overdue" : "Invoice overdue",
        detail: `${proj?.jobNumber} ${proj?.customer} — ${dollars(inv.amount)}`,
        refType: "invoice",
        refId: inv.id,
      });
    }
  }

  return out.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function severityRank(s: "info" | "warn" | "danger") {
  return s === "danger" ? 3 : s === "warn" ? 2 : 1;
}

// =====================================================================
// LIST HELPERS
// =====================================================================
export function todaysFollowUps(): Lead[] {
  return LEADS.filter((l) => {
    if (!l.nextActionDate) return false;
    const d = diffDays(l.nextActionDate);
    return d <= 1 && d >= -2 && l.stage !== "closed_won" && l.stage !== "closed_lost";
  }).sort((a, b) => {
    return diffDays(a.nextActionDate!) - diffDays(b.nextActionDate!);
  });
}

export function jobsAtRisk(): Project[] {
  return PROJECTS.filter((p) => p.health !== "on_track" && p.stage !== "closed")
    .sort((a, b) => (a.health === "at_risk" ? -1 : 1));
}

export function permitsInQueue(): Permit[] {
  return PERMITS
    .filter((p) => p.status !== "approved" && p.status !== "not_required")
    .sort((a, b) => b.ageDays - a.ageDays);
}

export function depositsNotReceived(): Project[] {
  return PROJECTS.filter(
    (p) =>
      (p.depositStatus === "invoiced" || p.depositStatus === "not_invoiced" || p.depositStatus === "partial") &&
      p.stage !== "closed",
  );
}

export function jobsStartingThisWeek(): Project[] {
  return PROJECTS.filter((p) => {
    if (!p.scheduledStart) return false;
    const d = diffDays(p.scheduledStart);
    return d >= -1 && d <= 7;
  }).sort((a, b) => diffDays(a.scheduledStart!) - diffDays(b.scheduledStart!));
}

export function jobsFinishingThisWeek(): Project[] {
  return PROJECTS.filter((p) => {
    if (!p.forecastCompletion) return false;
    const d = diffDays(p.forecastCompletion);
    return d >= -2 && d <= 7;
  }).sort((a, b) => diffDays(a.forecastCompletion!) - diffDays(b.forecastCompletion!));
}

export function completedAwaitingFinal(): Project[] {
  return PROJECTS.filter((p) => p.stage === "final_invoice" || p.stage === "punch_list");
}

export function scheduleByDate(): ScheduleItem[] {
  return [...SCHEDULE].sort((a, b) => a.date.localeCompare(b.date));
}

export function leadsByStage() {
  const map: Record<string, Lead[]> = {};
  for (const l of LEADS) {
    map[l.stage] = map[l.stage] || [];
    map[l.stage].push(l);
  }
  return map;
}

export function projectsByStage() {
  const map: Record<string, Project[]> = {};
  for (const p of PROJECTS) {
    map[p.stage] = map[p.stage] || [];
    map[p.stage].push(p);
  }
  return map;
}

export function getCrew(id: string | null) {
  return CREWS.find((c) => c.id === id) ?? null;
}

export function getEquipment() { return EQUIPMENT; }
export function getCrews() { return CREWS; }

export function projectInvoices(projectId: string) {
  return INVOICES.filter((i) => i.projectId === projectId);
}

export function projectPermit(projectId: string) {
  return PERMITS.find((p) => p.projectId === projectId);
}

export function projectScheduleItems(projectId: string) {
  return SCHEDULE.filter((s) => s.projectId === projectId);
}
