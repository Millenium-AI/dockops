import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { SCHEDULE, CREWS, EQUIPMENT, NOW } from "@/data/seed";
import { fmtDate, fmtRelative } from "@/data/selectors";
import { StatusBadge, Pill, StatCard, SectionHeader } from "@/components/ui-kit";
import { CalendarDays, List, Cloud, Anchor, Hammer, Truck, Wrench } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  site_visit: "Site Visit",
  estimate_review: "Estimate Review",
  permit_deadline: "Permit Deadline",
  material_delivery: "Material Delivery",
  fabrication_milestone: "Fabrication",
  mobilization: "Mobilization",
  install_start: "Install Start",
  install_finish: "Install Finish",
  inspection: "Inspection",
};

const TYPE_KIND: Record<string, "track" | "watch" | "risk" | "neutral" | "info"> = {
  site_visit: "info",
  estimate_review: "info",
  permit_deadline: "watch",
  material_delivery: "info",
  fabrication_milestone: "info",
  mobilization: "track",
  install_start: "track",
  install_finish: "track",
  inspection: "info",
};

export default function Schedule() {
  const [view, setView] = useState<"calendar" | "list">("calendar");

  // Build a 14-day window starting from today
  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = -1; i < 13; i++) {
      const d = new Date(NOW);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  const itemsByDay = useMemo(() => {
    const map: Record<string, typeof SCHEDULE> = {};
    for (const s of SCHEDULE) {
      const key = s.date.slice(0, 10);
      map[key] = map[key] || [];
      map[key].push(s);
    }
    return map;
  }, []);

  const totalNext7 = SCHEDULE.filter((s) => {
    const d = new Date(s.date).getTime();
    return d >= NOW.getTime() - 86400000 && d <= NOW.getTime() + 7 * 86400000;
  }).length;

  return (
    <AppShell
      title="Schedule & Operations"
      subtitle="Site visits, permit deadlines, deliveries, fabrication, crews, equipment & install windows"
      actions={
        <div className="flex items-center gap-1 p-0.5 rounded-md border border-border bg-card">
          <ViewToggle active={view === "calendar"} onClick={() => setView("calendar")} icon={<CalendarDays className="w-3.5 h-3.5" />} label="Calendar" />
          <ViewToggle active={view === "list"} onClick={() => setView("list")} icon={<List className="w-3.5 h-3.5" />} label="List" />
        </div>
      }
    >
      <div className="px-6 py-6 space-y-5 max-w-[1500px] mx-auto">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Next 7 days" value={totalNext7} sub="All scheduled events" />
          <StatCard label="Crews" value={CREWS.length} sub={`${CREWS.reduce((s,c) => s+c.size, 0)} field staff`} />
          <StatCard label="Equipment Available" value={EQUIPMENT.filter(e => e.status === "available").length} sub={`${EQUIPMENT.length} units total`} accent="good" />
          <StatCard label="In Maintenance" value={EQUIPMENT.filter(e => e.status === "maintenance").length} sub="Down units" accent={EQUIPMENT.filter(e=>e.status==="maintenance").length ? "warn" : "default"} />
        </section>

        {view === "calendar" ? (
          <section className="bg-card border border-card-border rounded-lg p-5">
            <SectionHeader title="Two-week operations window" hint="Dragless visualization · click any item for context" />
            <div className="grid grid-cols-7 gap-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium px-1">{d}</div>
              ))}
              {/* Pad start to align first day to its weekday */}
              {Array.from({ length: days[0].getDay() }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {days.map((day) => {
                const key = day.toISOString().slice(0, 10);
                const items = itemsByDay[key] || [];
                const isToday = day.toDateString() === NOW.toDateString();
                return (
                  <div
                    key={key}
                    className={`
                      min-h-[120px] rounded-md p-2 border
                      ${isToday ? "border-primary/50 bg-primary/5" : "border-border bg-background/40"}
                    `}
                  >
                    <div className="flex items-baseline justify-between">
                      <div className={`text-[11px] font-semibold num-display ${isToday ? "text-primary" : ""}`}>
                        {day.getDate()}
                      </div>
                      <div className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                        {day.toLocaleDateString("en-US", { month: "short" })}
                      </div>
                    </div>
                    <div className="mt-1.5 space-y-1">
                      {items.slice(0, 4).map((s) => (
                        <div
                          key={s.id}
                          className={`
                            text-[10.5px] leading-tight px-1.5 py-1 rounded
                            border-l-2 truncate
                            ${
                              s.type === "permit_deadline" ? "border-[hsl(38_92%_60%)] bg-[hsl(38_92%_60%)/0.08]" :
                              s.type === "install_start" || s.type === "install_finish" || s.type === "mobilization" ? "border-primary bg-primary/8" :
                              s.type === "material_delivery" ? "border-[hsl(210_80%_62%)] bg-[hsl(210_80%_62%)/0.08]" :
                              s.type === "site_visit" ? "border-muted-foreground/40 bg-muted/40" :
                              "border-muted-foreground/40 bg-muted/40"
                            }
                          `}
                          title={s.title}
                        >
                          {s.title}
                        </div>
                      ))}
                      {items.length > 4 && (
                        <div className="text-[10px] text-muted-foreground">+ {items.length - 4} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="bg-card border border-card-border rounded-lg p-5">
            <SectionHeader title="Upcoming items" hint="Sorted by date" />
            <ul className="divide-y divide-border">
              {[...SCHEDULE]
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((s) => (
                  <li key={s.id} className="py-3 flex items-start gap-4">
                    <div className="w-16 shrink-0">
                      <div className="text-[11px] font-semibold num-display">{fmtDate(s.date)}</div>
                      <div className="text-[10.5px] text-muted-foreground num-display">{fmtRelative(s.date)}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusBadge kind={TYPE_KIND[s.type]}>{TYPE_LABEL[s.type]}</StatusBadge>
                        {s.weatherRisk && s.weatherRisk !== "low" && (
                          <Pill className={s.weatherRisk === "high"
                            ? "bg-[hsl(0_80%_60%)/0.1] border-[hsl(0_80%_60%)/0.3] text-[hsl(0_80%_70%)]"
                            : "bg-[hsl(38_92%_60%)/0.1] border-[hsl(38_92%_60%)/0.3] text-[hsl(38_92%_62%)]"
                          }>
                            <Cloud className="w-3 h-3 mr-1 inline" /> {s.weatherRisk} weather
                          </Pill>
                        )}
                      </div>
                      <div className="text-[13px] mt-1">{s.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {s.crew && <>Crew: {s.crew} · </>}
                        {s.equipment && <>Equipment: {s.equipment.join(", ")}</>}
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-card border border-card-border rounded-lg p-5">
            <SectionHeader title={<span className="flex items-center gap-2"><Hammer className="w-3.5 h-3.5 text-primary" />Crews</span>} hint={`${CREWS.length} active crews`} />
            <ul className="divide-y divide-border">
              {CREWS.map((c) => (
                <li key={c.id} className="py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/25 grid place-items-center">
                    <Anchor className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium leading-tight">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">
                      Lead: {c.lead} · {c.size} crew · {c.specialties.join(", ")}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-card-border rounded-lg p-5">
            <SectionHeader title={<span className="flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-primary" />Equipment</span>} hint={`${EQUIPMENT.length} units · ${EQUIPMENT.filter(e=>e.status==="in_use").length} in use`} />
            <ul className="divide-y divide-border">
              {EQUIPMENT.map((e) => (
                <li key={e.id} className="py-2.5 flex items-center gap-3">
                  <Wrench className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium leading-tight">{e.name}</div>
                    <div className="text-[10.5px] text-muted-foreground capitalize">{e.type.replace("_", " ")}</div>
                  </div>
                  <StatusBadge kind={e.status === "available" ? "track" : e.status === "in_use" ? "info" : "watch"}>
                    {e.status === "in_use" ? "In Use" : e.status === "available" ? "Available" : "Maint."}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function ViewToggle({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      data-testid={`toggle-${label.toLowerCase()}`}
      className={`
        h-7 px-2.5 text-[11px] font-medium rounded-[3px] transition-colors flex items-center gap-1.5
        ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}
      `}
    >
      {icon}{label}
    </button>
  );
}
