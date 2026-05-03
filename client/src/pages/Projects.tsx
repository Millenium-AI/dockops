import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { KanbanBoard, KanbanColumn } from "@/components/Kanban";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectDrawer } from "@/components/ProjectDrawer";
import { PROJECTS } from "@/data/seed";
import { PROJECT_STAGES } from "@/data/types";
import type { Project, ProjectStage } from "@/data/types";
import { dollars } from "@/data/selectors";
import { Search } from "lucide-react";
import { StatCard } from "@/components/ui-kit";

export default function Projects() {
  const [query, setQuery] = useState("");
  const [healthFilter, setHealthFilter] = useState<"all" | "on_track" | "watch" | "at_risk">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const url = window.location.hash + "&" + window.location.search.replace(/^\?/, "");
    const m = url.match(/[?&]p=([^&?]+)/);
    if (m) setSelectedId(decodeURIComponent(m[1]));
  }, []);

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      if (healthFilter !== "all" && p.health !== healthFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          p.customer.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.jobNumber.toLowerCase().includes(q) ||
          p.scopeSummary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, healthFilter]);

  const grouped = useMemo(() => {
    const map: Record<ProjectStage, Project[]> = {} as any;
    for (const s of PROJECT_STAGES) map[s.id] = [];
    for (const p of filtered) map[p.stage].push(p);
    return map;
  }, [filtered]);

  const active = PROJECTS.filter((p) => p.stage !== "closed");
  const totalContract = active.reduce((s, p) => s + p.contractAmount, 0);
  const totalCost = active.reduce((s, p) => s + p.actualCostToDate, 0);
  const atRiskCount = active.filter((p) => p.health === "at_risk").length;
  const watchCount = active.filter((p) => p.health === "watch").length;

  const selected = PROJECTS.find((p) => p.id === selectedId) ?? null;

  return (
    <AppShell
      title="Projects Pipeline"
      subtitle="Sold to closed · 18 production stages · health flags & blockers visible per card"
      actions={
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              data-testid="input-search-projects"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="h-8 w-[260px] pl-7 pr-2 text-[12.5px] rounded-md border border-border bg-card placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/60"
            />
          </div>
          <Chip label="All" active={healthFilter === "all"} onClick={() => setHealthFilter("all")} />
          <Chip label="On Track" active={healthFilter === "on_track"} onClick={() => setHealthFilter("on_track")} />
          <Chip label="Watch" active={healthFilter === "watch"} onClick={() => setHealthFilter("watch")} />
          <Chip label="At Risk" active={healthFilter === "at_risk"} onClick={() => setHealthFilter("at_risk")} />
        </div>
      }
    >
      <div className="px-6 py-6 space-y-5">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Active Contract" value={dollars(totalContract, { compact: true })} sub={`${active.length} projects`} accent="good" />
          <StatCard label="Cost to Date" value={dollars(totalCost, { compact: true })} sub="Across active jobs" />
          <StatCard label="At Risk" value={atRiskCount} sub="Blockers escalated" accent={atRiskCount ? "bad" : "default"} />
          <StatCard label="Watch" value={watchCount} sub="Monitor closely" accent={watchCount ? "warn" : "default"} />
        </section>

        <KanbanBoard columns={PROJECT_STAGES.length}>
          {PROJECT_STAGES.map((stage) => {
            const cards = grouped[stage.id] ?? [];
            const value = cards.reduce((s, p) => s + p.contractAmount, 0);
            const accent =
              stage.id === "closed" ? "won"
              : ["mobilization", "piles_foundation", "framing", "decking", "accessories_finish"].includes(stage.id) ? "build"
              : "default";
            return (
              <KanbanColumn
                key={stage.id}
                label={stage.label}
                count={cards.length}
                value={value > 0 ? dollars(value, { compact: true }) : undefined}
                accent={accent as any}
              >
                {cards.length === 0 ? (
                  <div className="text-[11px] text-muted-foreground/60 italic px-2 py-3 text-center border border-dashed border-border/60 rounded-md">
                    No jobs
                  </div>
                ) : (
                  cards.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      isSelected={selectedId === p.id}
                      onClick={() => setSelectedId(p.id)}
                    />
                  ))
                )}
              </KanbanColumn>
            );
          })}
        </KanbanBoard>
      </div>

      <ProjectDrawer project={selected} onClose={() => setSelectedId(null)} />
    </AppShell>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      data-testid={`filter-health-${label.toLowerCase().replace(/ /g, "-")}`}
      className={`
        h-8 px-2.5 text-[11.5px] font-medium rounded-md border transition-colors hover-elevate
        ${active
          ? "bg-primary/15 border-primary/40 text-primary"
          : "bg-card border-border text-muted-foreground"}
      `}
    >
      {label}
    </button>
  );
}
