import { useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { KanbanBoard, KanbanColumn } from "@/components/Kanban";
import { LeadCard } from "@/components/LeadCard";
import { LeadDrawer } from "@/components/LeadDrawer";
import { LEADS } from "@/data/seed";
import { SALES_STAGES } from "@/data/types";
import type { Lead, SalesStage } from "@/data/types";
import { dollars } from "@/data/selectors";
import { Search, Flame, Filter } from "lucide-react";
import { StatCard } from "@/components/ui-kit";

export default function Sales() {
  const [query, setQuery] = useState("");
  const [tempFilter, setTempFilter] = useState<"all" | "hot" | "warm" | "cold">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Allow ?lead=L-xxxx deep link from dashboard
  useEffect(() => {
    const url = window.location.hash + "&" + window.location.search.replace(/^\?/, "");
    const m = url.match(/[?&]lead=([^&?]+)/);
    if (m) setSelectedId(decodeURIComponent(m[1]));
  }, []);

  const filtered = useMemo(() => {
    return LEADS.filter((l) => {
      if (tempFilter !== "all" && l.temperature !== tempFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          l.customer.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q) ||
          l.scopeNote.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, tempFilter]);

  const grouped = useMemo(() => {
    const map: Record<SalesStage, Lead[]> = {} as any;
    for (const s of SALES_STAGES) map[s.id] = [];
    for (const l of filtered) map[l.stage].push(l);
    return map;
  }, [filtered]);

  // KPIs
  const open = LEADS.filter((l) => l.stage !== "closed_won" && l.stage !== "closed_lost");
  const pipeline = open.reduce((s, l) => s + l.estimatedValue, 0);
  const weighted = open.reduce((s, l) => s + l.estimatedValue * (l.probability / 100), 0);
  const hotCount = open.filter((l) => l.temperature === "hot").length;
  const stale = open.filter((l) => l.daysInStage >= 10).length;

  const selected = LEADS.find((l) => l.id === selectedId) ?? null;

  return (
    <AppShell
      title="Sales Pipeline"
      subtitle="13 stages · drag-and-snap mental model · stage aging shown on every card"
      actions={
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              data-testid="input-search-leads"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads…"
              className="h-8 w-[260px] pl-7 pr-2 text-[12.5px] rounded-md border border-border bg-card placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/60"
            />
          </div>
          <FilterChip label="All"  active={tempFilter === "all"}  onClick={() => setTempFilter("all")} />
          <FilterChip label="Hot"  active={tempFilter === "hot"}  onClick={() => setTempFilter("hot")} icon={<Flame className="w-3 h-3" />} />
          <FilterChip label="Warm" active={tempFilter === "warm"} onClick={() => setTempFilter("warm")} />
          <FilterChip label="Cold" active={tempFilter === "cold"} onClick={() => setTempFilter("cold")} />
        </div>
      }
    >
      <div className="px-6 py-6 space-y-5">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Open Pipeline" value={dollars(pipeline, { compact: true })} sub={`${open.length} active leads`} />
          <StatCard label="Weighted" value={dollars(weighted, { compact: true })} sub="By close probability" accent="good" />
          <StatCard label="Hot Leads" value={hotCount} sub="High intent / short cycle" />
          <StatCard label="Stale (10d+)" value={stale} sub="Need action this week" accent={stale ? "warn" : "default"} />
        </section>

        <KanbanBoard columns={SALES_STAGES.length}>
          {SALES_STAGES.map((stage) => {
            const cards = grouped[stage.id] ?? [];
            const value = cards.reduce((s, l) => s + l.estimatedValue, 0);
            const accent =
              stage.id === "closed_won" ? "won"
              : stage.id === "closed_lost" ? "lost"
              : "default";
            return (
              <KanbanColumn
                key={stage.id}
                label={stage.short}
                count={cards.length}
                value={value > 0 ? dollars(value, { compact: true }) : undefined}
                accent={accent}
              >
                {cards.length === 0 ? (
                  <div className="text-[11px] text-muted-foreground/60 italic px-2 py-3 text-center border border-dashed border-border/60 rounded-md">
                    No leads
                  </div>
                ) : (
                  cards.map((l) => (
                    <LeadCard
                      key={l.id}
                      lead={l}
                      isSelected={selectedId === l.id}
                      onClick={() => setSelectedId(l.id)}
                    />
                  ))
                )}
              </KanbanColumn>
            );
          })}
        </KanbanBoard>
      </div>

      <LeadDrawer lead={selected} onClose={() => setSelectedId(null)} />
    </AppShell>
  );
}

function FilterChip({
  label, active, onClick, icon,
}: { label: string; active: boolean; onClick: () => void; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      data-testid={`filter-${label.toLowerCase()}`}
      className={`
        h-8 px-2.5 text-[11.5px] font-medium rounded-md border transition-colors hover-elevate
        flex items-center gap-1.5
        ${active
          ? "bg-primary/15 border-primary/40 text-primary"
          : "bg-card border-border text-muted-foreground"}
      `}
    >
      {icon}{label}
    </button>
  );
}
