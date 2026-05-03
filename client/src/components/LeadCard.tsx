import { Lead, DOCK_TYPE_LABEL } from "@/data/types";
import { dollars, fmtRelative, diffDays } from "@/data/selectors";
import { StatusBadge, Pill } from "./ui-kit";
import { Phone, MapPin } from "lucide-react";

export function LeadCard({
  lead, onClick, isSelected = false,
}: {
  lead: Lead;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const aging = lead.daysInStage;
  const stale = aging >= 10;
  const overdue =
    lead.nextActionDate ? diffDays(lead.nextActionDate) < 0 : !lead.nextActionDate;

  return (
    <button
      onClick={onClick}
      data-testid={`card-lead-${lead.id}`}
      className={`
        text-left w-full bg-card border rounded-md p-3 transition-colors
        hover-elevate
        ${isSelected ? "border-primary/50 ring-1 ring-primary/30" : "border-card-border"}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold leading-tight truncate">{lead.customer}</div>
          <div className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" /> {lead.address}
          </div>
        </div>
        <StatusBadge kind={lead.temperature === "hot" ? "hot" : lead.temperature === "warm" ? "warm" : "cold"}>
          {lead.temperature}
        </StatusBadge>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <Pill>{DOCK_TYPE_LABEL[lead.dockType]}</Pill>
        <Pill className="bg-primary/10 text-primary border-primary/25">
          {dollars(lead.estimatedValue, { compact: true })}
        </Pill>
        <Pill>{lead.probability}%</Pill>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-y-0.5 text-[11px]">
        <div className="text-muted-foreground">Source</div>
        <div className="text-right">{lead.source}</div>
        <div className="text-muted-foreground">Last contact</div>
        <div className="text-right num-display">{lead.daysSinceContact}d ago</div>
        <div className="text-muted-foreground">Next action</div>
        <div className={`text-right num-display ${overdue && lead.nextActionDate ? "text-[hsl(0_80%_70%)]" : ""}`}>
          {lead.nextActionDate ? fmtRelative(lead.nextActionDate) : "— none —"}
        </div>
        <div className="text-muted-foreground">Days in stage</div>
        <div className={`text-right num-display ${stale ? "text-[hsl(38_92%_62%)]" : ""}`}>{aging}d</div>
      </div>
    </button>
  );
}
