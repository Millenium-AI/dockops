import { useEffect } from "react";
import { Lead, DOCK_TYPE_LABEL, SALES_STAGES } from "@/data/types";
import { dollars, fmtRelative, fmtDate } from "@/data/selectors";
import { StatusBadge, Pill, SectionHeader } from "./ui-kit";
import { Mail, Phone, MapPin, X, User, Calendar, Activity, Flag } from "lucide-react";

export function LeadDrawer({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!lead) return null;
  const stage = SALES_STAGES.find((s) => s.id === lead.stage);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-30 backdrop-blur-[2px]"
        onClick={onClose}
        data-testid="overlay-drawer"
      />
      <aside
        className="fixed right-0 top-0 bottom-0 w-full max-w-[460px] bg-card border-l border-card-border z-40
                   flex flex-col"
        data-testid={`drawer-lead-${lead.id}`}
      >
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">Lead · {lead.id}</div>
            <h2 className="mt-1 text-[18px] font-semibold leading-tight">{lead.customer}</h2>
            <div className="mt-1 text-[12px] text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {lead.address}, {lead.city}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover-elevate"
            data-testid="button-close-drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto scroll-contain flex-1 p-5 space-y-6">
          {/* Top status block */}
          <div className="grid grid-cols-3 gap-3">
            <SmallStat label="Estimated" value={dollars(lead.estimatedValue, { compact: true })} accent="primary" />
            <SmallStat label="Probability" value={`${lead.probability}%`} />
            <SmallStat label="Days in stage" value={`${lead.daysInStage}d`} accent={lead.daysInStage >= 10 ? "warn" : undefined} />
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge kind="info">{stage?.label ?? lead.stage}</StatusBadge>
            <StatusBadge kind={lead.temperature === "hot" ? "hot" : lead.temperature === "warm" ? "warm" : "cold"}>
              {lead.temperature}
            </StatusBadge>
            <Pill>{DOCK_TYPE_LABEL[lead.dockType]}</Pill>
            <Pill>{lead.source}</Pill>
          </div>

          <div>
            <SectionHeader title="Scope" />
            <p className="text-[13px] text-muted-foreground leading-relaxed">{lead.scopeNote}</p>
          </div>

          <div>
            <SectionHeader title="Next action" />
            <div className="bg-background border border-border rounded-md p-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {lead.nextActionDate ? fmtRelative(lead.nextActionDate) : "Not scheduled"}
                </span>
                <span className="text-[10.5px] text-muted-foreground num-display">
                  {lead.nextActionDate ? fmtDate(lead.nextActionDate) : ""}
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] text-muted-foreground">
                {lead.nextActionNote || "—"}
              </p>
            </div>
          </div>

          <div>
            <SectionHeader title="Contact" />
            <ul className="space-y-2 text-[12.5px]">
              <li className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                {lead.customer}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-mono text-[12px]">{lead.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-mono text-[12px]">{lead.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                Last contact: {lead.daysSinceContact}d ago ({fmtDate(lead.lastContactDate)})
              </li>
              <li className="flex items-center gap-2">
                <Flag className="w-3.5 h-3.5 text-muted-foreground" />
                Owner: {lead.owner}
              </li>
            </ul>
          </div>

          {lead.notes && (
            <div>
              <SectionHeader title="Notes" />
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">{lead.notes}</p>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4 flex items-center justify-end gap-2">
          <button className="px-3 h-8 text-[12px] rounded-md border border-border hover-elevate" data-testid="button-log-call">
            Log call
          </button>
          <button className="px-3 h-8 text-[12px] rounded-md bg-primary text-primary-foreground font-medium hover-elevate" data-testid="button-advance-stage">
            Advance stage
          </button>
        </div>
      </aside>
    </>
  );
}

function SmallStat({
  label, value, accent,
}: {
  label: string;
  value: string;
  accent?: "primary" | "warn";
}) {
  const cls =
    accent === "primary" ? "text-primary"
    : accent === "warn" ? "text-[hsl(38_92%_62%)]"
    : "";
  return (
    <div className="bg-background border border-border rounded-md p-2.5">
      <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-medium">{label}</div>
      <div className={`mt-1 text-[16px] font-semibold leading-none num-display ${cls}`}>{value}</div>
    </div>
  );
}
