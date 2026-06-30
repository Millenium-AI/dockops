import { useState, useMemo, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { JobDrawer } from "@/components/JobDrawer";
import { SCHEDULE_EVENTS, JOBS, NOW } from "@/data/seed";
import type { ScheduleEvent } from "@/data/types";
import {
  CalendarDays, List, LayoutGrid, AlertTriangle, Clock, Package, Anchor, Wrench, CheckCircle2, X, ChevronLeft, ChevronRight
} from "lucide-react";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

// ── helpers ───────────────────────────────────────────────────────────────
const CREWS = ["Unassigned", "Crew A", "Crew B", "Crew C", "Crew D"] as const;

const EVENT_TYPE_LABEL: Record<ScheduleEvent["type"], string> = {
  site_visit:        "Site Visit",
  permit_deadline:   "Permit Deadline",
  material_delivery: "Delivery",
  install_start:     "Install Start",
  install_finish:    "Install Finish",
  inspection:        "Inspection",
};

const EVENT_TYPE_ICON: Record<ScheduleEvent["type"], React.ReactNode> = {
  site_visit:        <Anchor className="w-3.5 h-3.5" />,
  permit_deadline:   <AlertTriangle className="w-3.5 h-3.5" />,
  material_delivery: <Package className="w-3.5 h-3.5" />,
  install_start:     <Wrench className="w-3.5 h-3.5" />,
  install_finish:    <CheckCircle2 className="w-3.5 h-3.5" />,
  inspection:        <Clock className="w-3.5 h-3.5" />,
};

const EVENT_CHIP_STYLE: Record<ScheduleEvent["type"], string> = {
  site_visit:        "badge-site-visit border-l-2",
  permit_deadline:   "badge-permit-deadline border-l-2",
  material_delivery: "badge-delivery border-l-2",
  install_start:     "badge-install-start border-l-2",
  install_finish:    "badge-install-finish border-l-2",
  inspection:        "badge-inspection border-l-2",
};

const CREW_BADGE_STYLE: Record<string, string> = {
  "Crew A": "badge-crew-a",
  "Crew B": "badge-crew-b",
  "Crew C": "badge-crew-c",
  "Crew D": "badge-crew-d",
  "Nick":   "badge-crew-nick",
};

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtDay(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function fmtWeekday(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}
function fmtDayNum(iso: string) {
  return new Date(iso + "T12:00:00").getDate();
}
function isToday(iso: string) {
  return new Date(iso).toDateString() === NOW.toDateString();
}
function isPast(iso: string) {
  return new Date(iso) < NOW;
}
function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - NOW.getTime()) / 86_400_000);
}
function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}

// ── DraggableEventChip (local-state only drag-to-reschedule) ─────────
interface ChipProps {
  event: ScheduleEvent;
  onMove: (id: string, newDate: string) => void;
  onSelect: (event: ScheduleEvent) => void;
}

function EventChip({ event, onMove, onSelect }: ChipProps) {
  const dragData = useRef("");
  const style = EVENT_CHIP_STYLE[event.type];

  return (
    <div
      draggable
      onDragStart={(e) => {
        dragData.current = event.id;
        e.dataTransfer.setData("eventId", event.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => onSelect(event)}
      className={`
        flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium truncate cursor-pointer
        hover:opacity-80 transition-opacity
        ${style}
      `}
      title={event.title}
    >
      {EVENT_TYPE_ICON[event.type]}
      <span className="truncate">{event.title}</span>
    </div>
  );
}

// ── CalendarCell (drop target) ────────────────────────────────────────
interface CellProps {
  date: string;
  events: ScheduleEvent[];
  onDrop: (eventId: string, newDate: string) => void;
  onMove: (id: string, newDate: string) => void;
  onSelect: (event: ScheduleEvent) => void;
}

function CalendarCell({ date, events, onDrop, onMove, onSelect }: CellProps) {
  const [over, setOver] = useState(false);
  const today = isToday(date);
  const past  = isPast(date) && !today;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("eventId");
        if (id) onDrop(id, date);
      }}
      className={`
        min-h-[clamp(90px,10vh,140px)] rounded-lg border p-1.5 flex flex-col gap-1 transition-colors
        ${over    ? "border-primary bg-primary/5" :
          today   ? "ring-1 ring-primary bg-primary/5" :
          past    ? "border-border/50 bg-muted/20" :
                    "border-border bg-background/40"}
      `}
    >
      <div className={`text-xs font-semibold px-0.5 ${
        today ? "text-primary" : past ? "text-muted-foreground/50" : "text-muted-foreground"
      }`}>
        {new Date(date + "T12:00:00").getDate()}
        {today && <span className="ml-1 text-xs uppercase tracking-wider text-primary">Today</span>}
      </div>
      {events.map(ev => (
        <div key={ev.id} className={past ? "opacity-40" : ""}>
          <EventChip event={ev} onMove={onMove} onSelect={onSelect} />
        </div>
      ))}
      {over && (
        <div className="text-xs text-primary/60 text-center py-1 border border-dashed border-primary/30 rounded">
          Drop here
        </div>
      )}
    </div>
  );
}

// ── BoardCell (drop target for board view) ─────────────────────────────
interface BoardCellProps {
  date: string;
  events: ScheduleEvent[];
  onDrop: (eventId: string, newDate: string) => void;
  onMove: (id: string, newDate: string) => void;
  onSelect: (event: ScheduleEvent) => void;
}

function BoardCell({ date, events, onDrop, onMove, onSelect }: BoardCellProps) {
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("eventId");
        if (id) onDrop(id, date);
      }}
      className={`
        min-h-[clamp(80px,9vh,130px)] border-r border-border p-1.5 flex flex-col gap-1 transition-colors
        ${over ? "bg-primary/5" : ""}
      `}
    >
      {events.map(ev => (
        <EventChip key={ev.id} event={ev} onMove={onMove} onSelect={onSelect} />
      ))}
      {over && (
        <div className="text-xs text-primary/60 text-center py-1 border border-dashed border-primary/30 rounded">
          Drop here
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function Schedule() {
  const [view, setView] = useState<"board" | "calendar" | "list">("board");
  const [crewFilter, setCrewFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [events, setEvents] = useState<ScheduleEvent[]>(SCHEDULE_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [weekOffset, setWeekOffset] = useState(0);

  // Job for drawer — resolved from the selected event
  const selectedJob = useMemo(
    () => selectedEvent?.jobId ? JOBS.find(j => j.id === selectedEvent.jobId) ?? null : null,
    [selectedEvent]
  );

  // Board view: 7 days starting from today + weekOffset weeks
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(NOW);
      d.setDate(d.getDate() + i + weekOffset * 7);
      return d.toISOString().slice(0, 10);
    });
  }, [weekOffset]);

  // Calendar view: 28 days (4 weeks) starting from Monday of current week + weekOffset
  const calDays = useMemo(() => {
    const monday = getMonday(NOW);
    monday.setDate(monday.getDate() + weekOffset * 7);
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [weekOffset]);

  const calMonthHeader = useMemo(() => {
    const start = new Date(calDays[0] + "T12:00:00");
    const end = new Date(calDays[calDays.length - 1] + "T12:00:00");
    const sMonth = start.toLocaleDateString("en-US", { month: "long" });
    const eMonth = end.toLocaleDateString("en-US", { month: "long" });
    const sYear = start.getFullYear();
    const eYear = end.getFullYear();
    if (sMonth === eMonth && sYear === eYear) return `${sMonth} ${sYear}`;
    if (sYear === eYear) return `${sMonth} – ${eMonth} ${sYear}`;
    return `${sMonth} ${sYear} – ${eMonth} ${eYear}`;
  }, [calDays]);

  const filtered = useMemo(() => {
    return events.filter(ev => {
      if (crewFilter !== "all" && ev.crew !== crewFilter) return false;
      if (typeFilter !== "all" && ev.type !== typeFilter) return false;
      return true;
    });
  }, [events, crewFilter, typeFilter]);

  const byDay = useMemo(() => {
    const map: Record<string, ScheduleEvent[]> = {};
    for (const ev of filtered) {
      const k = ev.date.slice(0, 10);
      (map[k] ??= []).push(ev);
    }
    return map;
  }, [filtered]);

  // Drag-to-reschedule — updates local state only
  const handleDrop = (eventId: string, newDate: string) => {
    setEvents(prev => prev.map(ev =>
      ev.id === eventId ? { ...ev, date: newDate } : ev
    ));
  };

  const permitDeadlines = events.filter(e => e.type === "permit_deadline" && !dismissedAlerts.has(e.id));
  const overdue  = permitDeadlines.filter(e => daysUntil(e.date) < 0);
  const dueSoon  = permitDeadlines.filter(e => daysUntil(e.date) >= 0 && daysUntil(e.date) <= 7);

  const todayEvents = filtered.filter(e => isToday(e.date));

  return (
    <AppShell title="Schedule">
      <div className="space-y-3 w-full">

        {/* Today at a Glance strip */}
        <div className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-3 w-full">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12 shrink-0">Today</div>
          <div className="flex-1 overflow-x-auto flex gap-2 no-scrollbar">
            {todayEvents.length === 0 ? (
              <span className="text-xs text-muted-foreground/50 italic">Nothing scheduled today</span>
            ) : todayEvents.map(ev => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium truncate cursor-pointer hover:opacity-80 transition-opacity max-w-[160px] ${EVENT_CHIP_STYLE[ev.type]}`}
              >
                {EVENT_TYPE_ICON[ev.type]}
                <span className="truncate">{ev.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Permit alert strip */}
        {(overdue.length > 0 || dueSoon.length > 0) && (
          <div className="space-y-1.5 w-full">
            {overdue.map(ev => (
              <div key={ev.id} className="flex items-center gap-2 alert-overdue border rounded-lg px-4 py-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="flex-1"><span className="font-semibold">OVERDUE · {fmtShort(ev.date)}</span> — {ev.title}</span>
                {ev.note && <span className="text-red-400/80 ml-1">{ev.note}</span>}
                <button
                  onClick={() => setDismissedAlerts(prev => new Set(prev).add(ev.id))}
                  className="text-red-400 hover:text-red-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {dueSoon.map(ev => (
              <div key={ev.id} className="flex items-center gap-2 alert-due border rounded-lg px-4 py-2 text-sm">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="flex-1"><span className="font-semibold">Due {fmtShort(ev.date)} · in {daysUntil(ev.date)} days</span> — {ev.title}</span>
                <button
                  onClick={() => setDismissedAlerts(prev => new Set(prev).add(ev.id))}
                  className="text-amber-400 hover:text-amber-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap w-full">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-card">
            {(["board", "calendar", "list"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`h-7 px-3 text-xs font-medium rounded-[3px] transition-colors flex items-center gap-1.5
                  ${ view === v ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground" }`}
              >
                {v === "board" ? <LayoutGrid className="w-3.5 h-3.5" /> :
                 v === "calendar" ? <CalendarDays className="w-3.5 h-3.5" /> :
                 <List className="w-3.5 h-3.5" />}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Week nav (shown for calendar + board) */}
          {(view === "calendar" || view === "board") && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWeekOffset(o => o - 1)}
                className="h-7 w-7 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setWeekOffset(o => o + 1)}
                className="h-7 w-7 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Crew filter — shadcn Select */}
          <Select value={crewFilter} onValueChange={setCrewFilter}>
            <SelectTrigger className="h-8 w-[140px] text-sm bg-card border-border">
              <SelectValue placeholder="All Crews" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Crews</SelectItem>
              {CREWS.slice(1).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              <SelectItem value="Nick">Nick</SelectItem>
            </SelectContent>
          </Select>

          {/* Type filter — shadcn Select */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-[160px] text-sm bg-card border-border">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(EVENT_TYPE_LABEL).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="ml-auto text-sm text-muted-foreground">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Board view */}
        {view === "board" && (
          <div className="w-full overflow-x-auto relative">
            <div className="flex" style={{ minWidth: "max-content" }}>
              {/* Lane labels column — sticky left */}
              <div className="sticky left-0 z-20 bg-background shrink-0" style={{ width: "clamp(120px, 10vw, 160px)" }}>
                <div className="h-10 border-b border-border bg-background" />
                {CREWS.map(crew => (
                  <div key={crew} className="bg-muted/30 border-r border-border border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground" style={{ minHeight: "clamp(80px, 9vh, 130px)" }}>
                    {crew === "Unassigned"
                      ? <span className="italic text-muted-foreground/50">Unassigned</span>
                      : crew}
                  </div>
                ))}
              </div>
              {/* Day columns */}
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-7 min-w-full">
                  {weekDays.map(date => {
                    const today = isToday(date);
                    return (
                      <div key={date} className="min-w-0">
                        <div className={`h-10 border-b border-border px-2 py-1 text-xs text-muted-foreground text-center ${today ? "text-primary font-semibold border-b-2 border-b-primary" : ""}`}>
                          <div>{fmtWeekday(date)}</div>
                          <div>{fmtDayNum(date)}</div>
                        </div>
                        {CREWS.map(crew => {
                          const dayEvents = (byDay[date] ?? []).filter(ev =>
                            crew === "Unassigned" ? !ev.crew || ev.crew === "" : ev.crew === crew
                          );
                          return (
                            <div key={crew} className="border-b border-border">
                              <BoardCell
                                date={date}
                                events={dayEvents}
                                onDrop={handleDrop}
                                onMove={handleDrop}
                                onSelect={setSelectedEvent}
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar view */}
        {view === "calendar" && (
          <div className="w-full">
            {/* Month header — no week nav buttons, only the label */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-foreground">{calMonthHeader}</div>
              <div className="text-xs text-muted-foreground">
                Week {weekOffset === 0 ? "current" : weekOffset > 0 ? `+${weekOffset}` : weekOffset}
              </div>
            </div>
            {/* Day-of-week header */}
            <div className="grid grid-cols-7 gap-[clamp(0.25rem,0.5vw,0.5rem)] mb-1">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                <div key={d} className="text-xs uppercase tracking-wider text-muted-foreground font-medium px-1">{d}</div>
              ))}
            </div>
            {/* Rows — pad first day to weekday */}
            <div className="grid grid-cols-7 gap-[clamp(0.25rem,0.5vw,0.5rem)]">
              {Array.from({ length: (new Date(calDays[0] + "T12:00:00").getDay() + 6) % 7 }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {calDays.map(date => (
                <CalendarCell
                  key={date}
                  date={date}
                  events={byDay[date] ?? []}
                  onDrop={handleDrop}
                  onMove={handleDrop}
                  onSelect={setSelectedEvent}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground/50 mt-2">
              Drag events to reschedule · Changes are local to this session only
            </p>
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden w-full">
            <ul className="divide-y divide-border">
              {filtered.length === 0 && (
                <li className="py-10 text-center text-sm text-muted-foreground">No events match.</li>
              )}
              {Object.entries(
                [...filtered].reduce<Record<string, ScheduleEvent[]>>((acc, ev) => {
                  (acc[ev.date] ??= []).push(ev);
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, dayEvents]) => {
                  const sortedEvents = [...dayEvents].sort((a, b) => {
                    const crewOrder = (c: string | undefined) => {
                      const idx = CREWS.indexOf(c as any);
                      return idx >= 0 ? idx : 99;
                    };
                    const ca = crewOrder(a.crew), cb = crewOrder(b.crew);
                    if (ca !== cb) return ca - cb;
                    return a.type.localeCompare(b.type);
                  });
                  return (
                    <li key={date}>
                      <div className="bg-muted/30 px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 z-10">
                        {fmtDay(new Date(date + "T12:00:00"))} · {sortedEvents.length} event{sortedEvents.length !== 1 ? "s" : ""}
                      </div>
                      <ul className="divide-y divide-border">
                        {sortedEvents.map(ev => {
                          const style = EVENT_CHIP_STYLE[ev.type];
                          const past = isPast(ev.date) && !isToday(ev.date);
                          const crewClass = ev.crew ? CREW_BADGE_STYLE[ev.crew] : null;
                          const du = daysUntil(ev.date);
                          const countdownClass = du <= 2 && du >= 0 ? "text-red-400 font-bold" :
                            du <= 7 && du >= 0 ? "text-amber-400 font-semibold" :
                            "text-muted-foreground";
                          return (
                            <li
                              key={ev.id}
                              onClick={() => setSelectedEvent(ev)}
                              className="px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                            >
                              <div className={`shrink-0 px-2 py-1 rounded text-xs font-medium border ${style}`}>
                                {EVENT_TYPE_LABEL[ev.type]}
                              </div>
                              <div className={`text-sm font-medium flex-1 truncate ${past ? "text-muted-foreground/50" : "text-foreground"}`}>
                                {ev.title}
                              </div>
                              {crewClass && (
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${crewClass}`}>
                                  {ev.crew}
                                </span>
                              )}
                              <span className={`text-xs tabular-nums shrink-0 ${countdownClass}`}>
                                {du === 0 ? "Today" : du > 0 ? `in ${du}d` : `${Math.abs(du)}d ago`}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
      </div>

      <JobDrawer
        job={selectedJob}
        onClose={() => setSelectedEvent(null)}
      />
    </AppShell>
  );
}
