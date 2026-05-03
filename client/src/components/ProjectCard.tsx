import { Project, DOCK_TYPE_LABEL } from "@/data/types";
import { dollars, fmtRelative, getCrew } from "@/data/selectors";
import { StatusBadge, Pill } from "./ui-kit";
import { MapPin, AlertCircle } from "lucide-react";

export function ProjectCard({
  project, onClick, isSelected = false,
}: {
  project: Project;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const crew = getCrew(project.crewId);
  const stale = project.daysInStage >= 14;

  return (
    <button
      onClick={onClick}
      data-testid={`card-project-${project.id}`}
      className={`
        text-left w-full bg-card border rounded-md p-3 transition-colors hover-elevate
        ${isSelected ? "border-primary/50 ring-1 ring-primary/30" : "border-card-border"}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] num-display text-muted-foreground leading-none">{project.jobNumber}</div>
          <div className="text-[13px] font-semibold leading-tight truncate mt-0.5">{project.customer}</div>
          <div className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" /> {project.address}
          </div>
        </div>
        <StatusBadge kind={project.health === "at_risk" ? "risk" : project.health === "watch" ? "watch" : "track"}>
          {project.health === "at_risk" ? "At Risk" : project.health === "watch" ? "Watch" : "On Track"}
        </StatusBadge>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <Pill>{DOCK_TYPE_LABEL[project.dockType]}</Pill>
        <Pill className="bg-primary/10 text-primary border-primary/25">
          {dollars(project.contractAmount, { compact: true })}
        </Pill>
        {project.depositStatus !== "received" && (
          <Pill className="bg-[hsl(0_80%_60%)/0.1] text-[hsl(0_80%_70%)] border-[hsl(0_80%_60%)/0.3]">
            Deposit: {project.depositStatus.replace(/_/g, " ")}
          </Pill>
        )}
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-y-0.5 text-[11px]">
        <div className="text-muted-foreground">Start</div>
        <div className="text-right num-display">{fmtRelative(project.scheduledStart)}</div>
        <div className="text-muted-foreground">Finish</div>
        <div className="text-right num-display">{fmtRelative(project.forecastCompletion)}</div>
        <div className="text-muted-foreground">Crew</div>
        <div className="text-right truncate">{crew?.name.replace(/^Crew /, "Crew ").split(" — ")[0] ?? "—"}</div>
        <div className="text-muted-foreground">Days in stage</div>
        <div className={`text-right num-display ${stale ? "text-[hsl(38_92%_62%)]" : ""}`}>{project.daysInStage}d</div>
      </div>

      {project.blockingIssue && (
        <div className="mt-2 flex items-start gap-1.5 px-2 py-1.5 rounded bg-[hsl(0_80%_60%)/0.08] border border-[hsl(0_80%_60%)/0.2]">
          <AlertCircle className="w-3 h-3 mt-0.5 text-[hsl(0_80%_70%)] shrink-0" />
          <span className="text-[11px] text-[hsl(0_80%_75%)] leading-tight">{project.blockingIssue}</span>
        </div>
      )}
    </button>
  );
}
