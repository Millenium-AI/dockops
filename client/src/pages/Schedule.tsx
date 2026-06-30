import { useState, useMemo, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { JobDrawer } from "@/components/JobDrawer";
import { SCHEDULE_EVENTS, JOBS, NOW } from "@/data/seed";
import type { ScheduleEvent } from "@/data/types";
import { CalendarDays, List, AlertTriangle, Clock, Package, Anchor, Wrench, CheckCircle2 } from "lucide-react";

// ── helpers ─────────────────────────────────────────────────────────
const CREWS = ["Crew A", "Crew B", "Crew C", "Crew D"] as const;

const EVENT_TYPE_LABEL: Record<ScheduleEvent["type"], string> = {
  site_visit:       "Site Visit",
  permit_deadline:  "Permit Deadline",
  material_delivery:"Delivery",
  install_start:    "Install Start",
  install_finish:   "Install Finish",
  inspection:       "Inspection",
};

const EVENT_TYPE_ICON: Record<ScheduleEvent["type"], React.ReactNode> = {
  site_visit:        <Anchor className="w-3.5 h-3.5" />,
  permit_deadline:   <AlertTriangle className="w-3.5 h-3.5" />,
  material_delivery: <Package className="w-3.5 h-3.5" />,
  install_start:     <Wrench className="w-3.5 h-3.5" />,
  install_finish:    <CheckCircle2 className="w-3.5 h-3.5" />,
  inspection:        <Clock className="w-3.5 h-3.5" />,
};

type EventStyle = { border: string; bg: string; text: string };

const EVENT_TYPE_STYLE: Record<ScheduleEvent["type"], EventStyle> = {
  site_visit:        { border: "border-slate-400",  bg: "bg-slate-50",  text: "text-slate-700" },
  permit_deadline:   { border: "border-red-400",    bg: "bg-red-50",    text: "text-red-700" },
  material_delivery: { border: "border-blue-400",   bg: "bg-blue-50",   text: "text-blue-700" },
  install_start:     { border: "border-green-500",  bg: "bg-green-50",  text: "text-green-700" },
  install_finish:    { border: "border-green-400",  bg: "bg-green-50",  text: "text-green-600" },
  inspection:        { border: "border-amber-400",  bg: "bg-amber-50",  text: "text-amber-700" },
};

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtDay(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
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

// ── DraggableEventChip (local-state only drag-to-reschedule) ─────────
interface ChipProps {
  event: ScheduleEvent;
  onMove: (id: string, newDate: string) => void;
  onSelect: (event: ScheduleEvent) => void;
}

function EventChip({ event, onMove, onSelect }: ChipProps) {
  const style = EVENT_TYPE_STYLE[event.type];
  const dragData = useRef("");

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
        flex items-center gap-1.5 px-2 py-1 rounded border-l-2 cursor-grab active:cursor-grabbing
        text-[11px] font-medium leading-tight truncate select-none
        hover:opacity-80 transition-opacity
        ${style.border} ${style.bg} ${style.text}
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
        min-h-[110px] rounded-lg border p-1.5 flex flex-col gap-1 transition-colors
        ${over    ? "border-primary bg-primary/5" :
          today   ? "border-primary/40 bg-primary/3" :
          past    ? "border-border/50 bg-muted/20" :
                    "border-border bg-background/40"}
      `}
    >
      <div className={`text-[10px] font-semibold px-0.5 ${
        today ? "text-primary" : past ? "text-muted-foreground/50" : "text-muted-foreground"
      }`}>
        {new Date(date + "T12:00:00").getDate()}
        {today && <span className="ml-1 text-[9px] uppercase tracking-wider text-primary">Today</span>}
      </div>
      {events.map(ev => (
        <EventChip key={ev.id} event={ev} onMove={onMove} onSelect={onSelect} />
      ))}
      {over && (
        <div className="text-[10px] text-primary/60 text-center py-1 border border-dashed border-primary/30 rounded">
          Drop here
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function Schedule() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [crewFilter, setCrewFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [events, setEvents] = useState<ScheduleEvent[]>(SCHEDULE_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  // Job for drawer — resolved from the selected event
  const selectedJob = useMemo(
    () => selectedEvent?.jobId ? JOBS.find(j => j.id === selectedEvent.jobId) ?? null : null,
    [selectedEvent]
  );

  // 14-day window (today ± 1 day for context)
  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(NOW);
      d.setDate(d.getDate() + i - 1);
      return d.toISOString().slice(0, 10);
    });
  }, []);

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

  const permitDeadlines = events.filter(e => e.type === "permit_deadline");
  const overdue  = permitDeadlines.filter(e => daysUntil(e.date) < 0);
  const dueSoon  = permitDeadlines.filter(e => daysUntil(e.date) >= 0 && daysUntil(e.date) <= 7);

  return (
    <AppShell title="Schedule">
      <div className="px-5 py-4 space-y-4 max-w-[1600px] mx-auto">

        {/* Permit alert strip */}
        {(overdue.length > 0 || dueSoon.length > 0) && (
          <div className="space-y-1.5">
            {overdue.map(ev => (
              <div key={ev.id} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-[12px] text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span><span className="font-semibold">OVERDUE:</span> {ev.title}</span>
                {ev.note && <span className="text-red-600/80 ml-1">— {ev.note}</span>}
              </div>
            ))}
            {dueSoon.map(ev => (
              <div key={ev.id} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-[12px] text-amber-800">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span><span className="font-semibold">Due in {daysUntil(ev.date)}d:</span> {ev.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-card">
            {(["calendar", "list"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`h-7 px-3 text-[11px] font-medium rounded-[3px] transition-colors flex items-center gap-1.5
                  ${ view === v ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground" }`}
              >
                {v === "calendar" ? <CalendarDays className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Crew filter */}
          <select
            value={crewFilter}
            onChange={e => setCrewFilter(e.target.value)}
            className="h-8 px-2 text-[12px] rounded-md border border-border bg-card focus:outline-none focus:border-primary/60"
          >
            <option value="all">All Crews</option>
            {CREWS.map(c => <option key={c} value={c}>{c}</option>)}
            <option value="Nick">Nick</option>
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="h-8 px-2 text-[12px] rounded-md border border-border bg-card focus:outline-none focus:border-primary/60"
          >
            <option value="all">All Types</option>
            {Object.entries(EVENT_TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <span className="ml-auto text-[12px] text-muted-foreground">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Calendar view */}
        {view === "calendar" && (
          <div>
            {/* Day-of-week header */}
            <div className="grid grid-cols-7 gap-2 mb-1">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1">{d}</div>
              ))}
            </div>
            {/* Rows — pad first day to weekday */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: new Date(days[0] + "T12:00:00").getDay() }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {days.map(date => (
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
            <p className="text-[10px] text-muted-foreground/50 mt-2">
              Drag events to reschedule &middot; Changes are local to this session only
            </p>
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <ul className="divide-y divide-border">
              {filtered.length === 0 && (
                <li className="py-10 text-center text-[12px] text-muted-foreground">No events match.</li>
              )}
              {[...filtered]
                .sort((a, b) => a.date.localeCompare(b.date))
                .map(ev => {
                  const style = EVENT_TYPE_STYLE[ev.type];
                  const past = isPast(ev.date) && !isToday(ev.date);
                  return (
                    <li
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`flex items-start gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors
                        ${past ? "opacity-50" : ""}`}
                    >
                      <div className="w-20 shrink-0">
                        <div className="text-[12px] font-semibold">{fmtShort(ev.date)}</div>
                        {isToday(ev.date) && <div className="text-[10px] text-primary font-medium">Today</div>}
                        {!isToday(ev.date) && (
                          <div className="text-[10px] text-muted-foreground">
                            {daysUntil(ev.date) < 0
                              ? `${Math.abs(daysUntil(ev.date))}d ago`
                              : `in ${daysUntil(ev.date)}d`}
                          </div>
                        )}
                      </div>
                      <div className={`w-1 self-stretch rounded-full shrink-0 ${style.border.replace("border-", "bg-")}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${style.text}`}>
                            {EVENT_TYPE_ICON[ev.type]}
                            {EVENT_TYPE_LABEL[ev.type]}
                          </span>
                          {ev.crew && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {ev.crew}
                            </span>
                          )}
                        </div>
                        <div className="text-[13px] font-medium leading-snug">{ev.title}</div>
                        {ev.note && (
                          <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{ev.note}</div>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
      </div>

      {/* Clicking an event tied to a job opens the job drawer */}
      <JobDrawer job={selectedJob} onClose={() => setSelectedEvent(null)} />
    </AppShell>
  );
}
