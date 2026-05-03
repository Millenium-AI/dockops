// Tiny purpose-built UI primitives — kept here to avoid bloating shadcn imports.
import { ReactNode } from "react";

// =================================================================
// StatusBadge
// =================================================================
type StatusKind =
  | "track" | "watch" | "risk" | "neutral" | "info"
  | "won" | "lost" | "hot" | "warm" | "cold";

const STATUS_CLASS: Record<StatusKind, string> = {
  track:  "status-track",
  watch:  "status-watch",
  risk:   "status-risk",
  neutral:"status-neutral",
  info:   "status-info",
  won:    "status-track",
  lost:   "status-neutral",
  hot:    "status-risk",
  warm:   "status-watch",
  cold:   "status-info",
};

export function StatusBadge({
  kind, children, dot = true, className = "",
}: {
  kind: StatusKind;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded
        text-[10.5px] font-medium uppercase tracking-[0.06em] border
        ${STATUS_CLASS[kind]} ${className}
      `}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

// =================================================================
// Pill (low-emphasis tag)
// =================================================================
export function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`
        inline-flex items-center px-1.5 h-[18px] rounded text-[10px] font-medium
        bg-muted/60 text-muted-foreground border border-border/60
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// =================================================================
// Stat / KPI card
// =================================================================
export function StatCard({
  label, value, sub, accent, hint, icon,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  hint?: ReactNode;
  accent?: "default" | "good" | "warn" | "bad";
  icon?: ReactNode;
}) {
  const accentText =
    accent === "good" ? "text-[hsl(174_58%_60%)]"
    : accent === "warn" ? "text-[hsl(38_92%_62%)]"
    : accent === "bad" ? "text-[hsl(0_80%_65%)]"
    : "";
  return (
    <div className="bg-card border border-card-border rounded-lg p-4 hover-elevate">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-medium">{label}</div>
        {icon && <div className="text-muted-foreground/70">{icon}</div>}
      </div>
      <div className={`mt-2 num-display text-2xl font-semibold leading-none ${accentText}`}>{value}</div>
      {(sub || hint) && (
        <div className="mt-2 flex items-baseline gap-2 text-[12px]">
          {sub && <span className="text-muted-foreground">{sub}</span>}
          {hint && <span className={accentText || "text-muted-foreground"}>{hint}</span>}
        </div>
      )}
    </div>
  );
}

// =================================================================
// Section header
// =================================================================
export function SectionHeader({
  title, hint, action,
}: { title: ReactNode; hint?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        <h2 className="text-[14px] font-semibold tracking-tight leading-none">{title}</h2>
        {hint && <p className="text-[11.5px] text-muted-foreground mt-1.5">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

// =================================================================
// Empty state
// =================================================================
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-4 py-10 text-center border border-dashed border-border rounded-lg">
      <div className="text-[13px] text-muted-foreground font-medium">{title}</div>
      {hint && <div className="text-[11.5px] text-muted-foreground/70 mt-1">{hint}</div>}
    </div>
  );
}

// =================================================================
// Mini sparkline (svg) — used in finance/dashboard
// =================================================================
export function Sparkline({
  values,
  color = "hsl(174 58% 55%)",
  className = "",
  width = 220,
  height = 56,
}: { values: number[]; color?: string; className?: string; width?: number; height?: number }) {
  if (values.length === 0) return null;
  const pad = 2;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const step = (width - pad * 2) / (values.length - 1 || 1);
  const coords = values.map((v, i) => {
    const x = pad + i * step;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });
  const linePts = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath =
    `M ${coords[0][0]},${height - pad} ` +
    coords.map(([x, y]) => `L ${x.toFixed(1)},${y.toFixed(1)}`).join(" ") +
    ` L ${coords[coords.length - 1][0].toFixed(1)},${height - pad} Z`;
  const gradId = `sparkfill-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <polyline
        points={linePts}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {coords.map(([x, y], i) =>
        i === coords.length - 1 ? (
          <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
        ) : null,
      )}
    </svg>
  );
}
