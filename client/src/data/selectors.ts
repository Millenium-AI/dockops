// selectors.ts — lightweight helpers for the new 3-entity model
// Only exports used by live pages (Board, Schedule, Customers).
// Old LEADS / PROJECTS / PERMITS / INVOICES exports removed —
// those entities no longer exist in seed.ts.

import { NOW } from "./seed";

export function todayISO(): string {
  return NOW.toISOString().slice(0, 10);
}

export function diffDays(iso: string | null | undefined): number {
  if (!iso) return 0;
  return Math.round((new Date(iso).getTime() - NOW.getTime()) / 86_400_000);
}

export function dollars(n: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact && Math.abs(n) >= 1_000) {
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    return `$${Math.round(n / 1_000)}k`;
  }
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = diffDays(iso);
  if (d === 0)  return "Today";
  if (d === 1)  return "Tomorrow";
  if (d === -1) return "Yesterday";
  if (d > 0 && d < 7)   return `In ${d}d`;
  if (d < 0 && d > -14) return `${Math.abs(d)}d ago`;
  return fmtDate(iso);
}
