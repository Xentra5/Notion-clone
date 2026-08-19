"use client";

import {
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { toast } from "sonner";
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/actions/calendar";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  MapPin,
  Tag,
  Calendar,
  List,
  Grid3x3,
  AlignJustify,
  Trash2,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type EventColor =
  | "blue"
  | "red"
  | "green"
  | "yellow"
  | "purple"
  | "pink"
  | "orange"
  | "gray";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;        // YYYY-MM-DD
  startTime?: string;  // HH:MM
  endTime?: string;
  color: EventColor;
  description?: string;
  location?: string;
  allDay?: boolean;
  tags?: string[];
  attendees?: string[];
}

type ViewMode = "month" | "week" | "day" | "agenda";

// ── Helpers ────────────────────────────────────────────────────────────────────
const EVENT_COLORS: Record<EventColor, { bg: string; text: string; border: string; dot: string }> = {
  blue:   { bg: "bg-[#2383e2]/15", text: "text-[#2383e2]", border: "border-[#2383e2]/30", dot: "bg-[#2383e2]" },
  red:    { bg: "bg-red-500/15",   text: "text-red-400",   border: "border-red-400/30",   dot: "bg-red-400" },
  green:  { bg: "bg-emerald-500/15",text: "text-emerald-400",border:"border-emerald-400/30",dot:"bg-emerald-400"},
  yellow: { bg: "bg-amber-400/15", text: "text-amber-400", border: "border-amber-400/30", dot: "bg-amber-400" },
  purple: { bg: "bg-purple-500/15",text: "text-purple-400",border: "border-purple-400/30",dot: "bg-purple-400"},
  pink:   { bg: "bg-pink-500/15",  text: "text-pink-400",  border: "border-pink-400/30",  dot: "bg-pink-400" },
  orange: { bg: "bg-orange-500/15",text: "text-orange-400",border: "border-orange-400/30",dot: "bg-orange-400"},
  gray:   { bg: "bg-foreground/8", text: "text-foreground/60",border:"border-foreground/15",dot:"bg-foreground/30"},
};

const COLOR_OPTIONS: EventColor[] = ["blue","red","green","yellow","purple","pink","orange","gray"];

function pad(n: number) { return String(n).padStart(2, "0"); }
function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
function todayStr() { return formatDate(new Date()); }

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ── Initial seed events ────────────────────────────────────────────────────────
function seedEvents(): CalendarEvent[] {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  const f = (day: number) =>
    `${y}-${pad(m + 1)}-${pad(day)}`;

  return [
    {
      id: "1",
      title: "Team Standup",
      date: f(d),
      startTime: "09:00",
      endTime: "09:30",
      color: "blue",
      description: "Daily sync with the engineering team",
      attendees: ["Alice", "Bob", "Carol"],
      tags: ["meeting", "recurring"],
    },
    {
      id: "2",
      title: "Product Review",
      date: f(d),
      startTime: "14:00",
      endTime: "15:00",
      color: "purple",
      description: "Q3 product roadmap review",
      location: "Conference Room A",
      attendees: ["Dave", "Emma"],
      tags: ["product"],
    },
    {
      id: "3",
      title: "Design Sprint",
      date: f(Math.min(d + 1, 28)),
      startTime: "10:00",
      endTime: "12:00",
      color: "green",
      tags: ["design"],
    },
    {
      id: "4",
      title: "1:1 with Manager",
      date: f(Math.min(d + 2, 28)),
      startTime: "11:00",
      endTime: "11:30",
      color: "orange",
    },
    {
      id: "5",
      title: "Release Day 🚀",
      date: f(Math.min(d + 3, 28)),
      allDay: true,
      color: "red",
      description: "v2.0 goes live",
      tags: ["milestone"],
    },
    {
      id: "6",
      title: "Offsite Planning",
      date: f(Math.max(d - 2, 1)),
      allDay: true,
      color: "yellow",
    },
  ];
}

// ── Event Form Modal ───────────────────────────────────────────────────────────
function EventModal({
  event,
  defaultDate,
  onSave,
  onDelete,
  onClose,
}: {
  event?: CalendarEvent;
  defaultDate?: string;
  onSave: (e: CalendarEvent) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}) {
  const isEdit = !!event;
  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState(event?.date ?? defaultDate ?? todayStr());
  const [startTime, setStartTime] = useState(event?.startTime ?? "09:00");
  const [endTime, setEndTime] = useState(event?.endTime ?? "10:00");
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [color, setColor] = useState<EventColor>(event?.color ?? "blue");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [tagInput, setTagInput] = useState((event?.tags ?? []).join(", "));

  const handleSave = () => {
    if (!title.trim()) return;
    const tags = tagInput.split(",").map(t => t.trim()).filter(Boolean);
    onSave({
      id: event?.id ?? `evt-${Date.now()}`,
      title: title.trim(),
      date,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      allDay,
      color,
      description: description || undefined,
      location: location || undefined,
      tags: tags.length ? tags : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[var(--bg-modal,#ffffff)] dark:bg-[#1f1f1f] border border-[#e9e9e7] dark:border-[#3d3d3d] rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--cal-modal-bg)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e9e9e7] dark:border-[#2f2f2f]">
          <h2 className="text-[15px] font-semibold text-foreground">
            {isEdit ? "Edit event" : "New event"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
            placeholder="Event name"
            className="w-full text-[16px] font-medium bg-transparent border-b border-foreground/10 focus:border-[#2383e2] outline-none pb-2 text-foreground placeholder:text-foreground/30 transition-colors"
          />

          {/* Color picker */}
          <div className="flex items-center gap-2">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-5 w-5 rounded-full ${EVENT_COLORS[c].dot} transition-transform ${color === c ? "ring-2 ring-offset-2 ring-foreground/30 scale-110" : "hover:scale-110"}`}
              />
            ))}
          </div>

          {/* Date & Time */}
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 text-[13px] text-foreground/70">
              <Calendar className="h-3.5 w-3.5 text-foreground/40 shrink-0" />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-transparent border border-foreground/10 rounded-md px-2 py-1 text-foreground outline-none focus:border-[#2383e2] transition-colors text-[13px]"
              />
            </label>

            <label className="flex items-center gap-3 text-[13px] text-foreground/70">
              <input
                type="checkbox"
                checked={allDay}
                onChange={e => setAllDay(e.target.checked)}
                className="rounded"
              />
              <span>All day</span>
            </label>

            {!allDay && (
              <div className="flex items-center gap-2 ml-7">
                <Clock className="h-3.5 w-3.5 text-foreground/40 shrink-0" />
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="bg-transparent border border-foreground/10 rounded-md px-2 py-1 text-foreground outline-none focus:border-[#2383e2] text-[13px]"
                />
                <span className="text-foreground/40 text-[12px]">to</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="bg-transparent border border-foreground/10 rounded-md px-2 py-1 text-foreground outline-none focus:border-[#2383e2] text-[13px]"
                />
              </div>
            )}
          </div>

          {/* Location */}
          <label className="flex items-center gap-3 text-[13px] text-foreground/70">
            <MapPin className="h-3.5 w-3.5 text-foreground/40 shrink-0" />
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Add location"
              className="flex-1 bg-transparent border-b border-foreground/10 focus:border-[#2383e2] outline-none pb-1 text-foreground placeholder:text-foreground/30 transition-colors text-[13px]"
            />
          </label>

          {/* Tags */}
          <label className="flex items-center gap-3 text-[13px] text-foreground/70">
            <Tag className="h-3.5 w-3.5 text-foreground/40 shrink-0" />
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="Tags (comma separated)"
              className="flex-1 bg-transparent border-b border-foreground/10 focus:border-[#2383e2] outline-none pb-1 text-foreground placeholder:text-foreground/30 transition-colors text-[13px]"
            />
          </label>

          {/* Description */}
          <div className="flex items-start gap-3 text-[13px] text-foreground/70">
            <AlignJustify className="h-3.5 w-3.5 text-foreground/40 shrink-0 mt-0.5" />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add description…"
              rows={2}
              className="flex-1 bg-foreground/[0.03] border border-foreground/10 rounded-lg px-3 py-2 text-foreground placeholder:text-foreground/30 outline-none focus:border-[#2383e2] resize-none transition-colors text-[13px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#e9e9e7] dark:border-[#2f2f2f] flex items-center justify-between">
          {isEdit && onDelete ? (
            <button
              onClick={() => { onDelete(event!.id); onClose(); }}
              className="flex items-center gap-1.5 text-[12px] text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-[13px] text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-4 py-1.5 rounded-lg text-[13px] font-medium bg-[#2383e2] hover:bg-[#1a73d8] text-white transition-colors disabled:opacity-40"
            >
              {isEdit ? "Save changes" : "Create event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Event chip (used inside calendar cells) ────────────────────────────────────
function EventChip({
  event,
  onClick,
  compact = false,
}: {
  event: CalendarEvent;
  onClick: () => void;
  compact?: boolean;
}) {
  const c = EVENT_COLORS[event.color];
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-full text-left rounded-[4px] px-1.5 ${compact ? "py-px" : "py-0.5"} text-[11px] font-medium leading-tight truncate transition-opacity hover:opacity-80 border ${c.bg} ${c.text} ${c.border}`}
    >
      {!event.allDay && event.startTime && (
        <span className="opacity-70 mr-1 font-normal">{event.startTime}</span>
      )}
      {event.title}
    </button>
  );
}

// ── MONTH VIEW ─────────────────────────────────────────────────────────────────
function MonthView({
  year,
  month,
  events,
  today,
  onDayClick,
  onEventClick,
}: {
  year: number;
  month: number;
  events: CalendarEvent[];
  today: string;
  onDayClick: (date: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  // Fill grid (42 cells = 6 rows × 7 days)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = (day: number) => {
    const ds = `${year}-${pad(month+1)}-${pad(day)}`;
    return events.filter(e => e.date === ds);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-foreground/[0.06]">
        {DAYS.map(d => (
          <div key={d} className="py-2 text-center text-[11px] font-semibold text-foreground/40 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="flex-1 grid grid-cols-7" style={{ gridTemplateRows: `repeat(${cells.length / 7}, minmax(0, 1fr))` }}>
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`null-${i}`} className="border-b border-r border-foreground/[0.05] bg-foreground/[0.01]" />;
          }
          const ds = `${year}-${pad(month+1)}-${pad(day)}`;
          const isToday = ds === today;
          const dayEvents = eventsForDay(day);
          const overflow = dayEvents.length > 3;
          const visible = dayEvents.slice(0, 3);

          return (
            <div
              key={day}
              onClick={() => onDayClick(ds)}
              className="border-b border-r border-foreground/[0.05] p-1.5 flex flex-col gap-0.5 cursor-pointer hover:bg-foreground/[0.02] transition-colors group min-h-0 overflow-hidden"
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-[12px] font-medium w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                  isToday
                    ? "bg-[#2383e2] text-white font-bold"
                    : "text-foreground/70 group-hover:text-foreground"
                }`}>
                  {day}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); onDayClick(ds); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-foreground/40 hover:text-[#2383e2] hover:bg-[#2383e2]/10 transition"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Events */}
              <div className="flex flex-col gap-0.5 flex-1 overflow-hidden">
                {visible.map(ev => (
                  <EventChip key={ev.id} event={ev} onClick={() => onEventClick(ev)} compact />
                ))}
                {overflow && (
                  <button
                    onClick={e => { e.stopPropagation(); onDayClick(ds); }}
                    className="text-[10px] text-foreground/40 hover:text-foreground/70 text-left px-1.5 transition-colors"
                  >
                    +{dayEvents.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── WEEK VIEW ─────────────────────────────────────────────────────────────────
function WeekView({
  year,
  month,
  day,
  events,
  today,
  onSlotClick,
  onEventClick,
}: {
  year: number;
  month: number;
  day: number;
  events: CalendarEvent[];
  today: string;
  onSlotClick: (date: string, time: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}) {
  const startOfWeek = useMemo(() => {
    const d = new Date(year, month, day);
    const dow = d.getDay();
    d.setDate(d.getDate() - dow);
    return d;
  }, [year, month, day]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    }),
    [startOfWeek]
  );

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const eventsForSlot = (date: string, hour: number) =>
    events.filter(e => {
      if (e.date !== date || e.allDay) return false;
      const h = parseInt(e.startTime?.split(":")?.[0] ?? "-1");
      return h === hour;
    });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header row */}
      <div className="grid border-b border-foreground/[0.06]" style={{ gridTemplateColumns: "3.5rem 1fr" }}>
        <div />
        <div className="grid grid-cols-7">
          {weekDays.map(d => {
            const ds = formatDate(d);
            const isToday = ds === today;
            return (
              <div key={ds} className="py-2.5 text-center border-l border-foreground/[0.05]">
                <div className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wide">
                  {DAYS[d.getDay()]}
                </div>
                <div className={`text-[16px] font-bold mt-0.5 w-9 h-9 mx-auto flex items-center justify-center rounded-full transition-colors ${
                  isToday ? "bg-[#2383e2] text-white" : "text-foreground/80"
                }`}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All-day row */}
      <div className="grid border-b border-foreground/[0.06]" style={{ gridTemplateColumns: "3.5rem 1fr" }}>
        <div className="text-[10px] text-foreground/40 pt-1.5 pr-2 text-right">ALL DAY</div>
        <div className="grid grid-cols-7 min-h-[32px]">
          {weekDays.map(d => {
            const ds = formatDate(d);
            const allDayEvts = events.filter(e => e.date === ds && e.allDay);
            return (
              <div key={ds} className="border-l border-foreground/[0.05] p-0.5 flex flex-col gap-0.5">
                {allDayEvts.map(ev => (
                  <EventChip key={ev.id} event={ev} onClick={() => onEventClick(ev)} compact />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid" style={{ gridTemplateColumns: "3.5rem 1fr" }}>
          <div>
            {hours.map(h => (
              <div key={h} className="h-14 border-b border-foreground/[0.04] flex items-start justify-end pr-2 pt-0.5">
                {h > 0 && <span className="text-[10px] text-foreground/30">{h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h-12} PM`}</span>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-l border-foreground/[0.05]">
            {weekDays.map(d => {
              const ds = formatDate(d);
              return (
                <div key={ds} className="border-l border-foreground/[0.05]">
                  {hours.map(h => {
                    const slotEvts = eventsForSlot(ds, h);
                    return (
                      <div
                        key={h}
                        onClick={() => onSlotClick(ds, `${pad(h)}:00`)}
                        className="h-14 border-b border-foreground/[0.04] px-0.5 pt-0.5 cursor-pointer hover:bg-[#2383e2]/[0.04] transition-colors group"
                      >
                        {slotEvts.map(ev => (
                          <EventChip key={ev.id} event={ev} onClick={() => onEventClick(ev)} />
                        ))}
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
  );
}

// ── AGENDA VIEW ────────────────────────────────────────────────────────────────
function AgendaView({
  events,
  today,
  onEventClick,
  onAddClick,
}: {
  events: CalendarEvent[];
  today: string;
  onEventClick: (event: CalendarEvent) => void;
  onAddClick: (date: string) => void;
}) {
  const sorted = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach(e => {
      if (!grouped[e.date]) grouped[e.date] = [];
      grouped[e.date].push(e);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, evts]) => ({
        date,
        events: evts.sort((a, b) => (a.startTime ?? "00:00").localeCompare(b.startTime ?? "00:00")),
      }));
  }, [events]);

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-foreground/30">
        <Calendar className="h-12 w-12" />
        <p className="text-sm">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
      {sorted.map(({ date, events: dayEvts }) => {
        const d = new Date(date + "T00:00:00");
        const isToday = date === today;
        return (
          <div key={date}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex flex-col items-center w-12 ${isToday ? "text-[#2383e2]" : "text-foreground/50"}`}>
                <span className="text-[10px] font-semibold uppercase tracking-wider">{DAYS[d.getDay()]}</span>
                <span className={`text-[24px] font-bold leading-none mt-0.5 ${isToday ? "text-[#2383e2]" : "text-foreground"}`}>
                  {d.getDate()}
                </span>
                <span className="text-[10px]">{SHORT_MONTHS[d.getMonth()]}</span>
              </div>
              <div className="flex-1 border-t border-foreground/[0.07]" />
              <button
                onClick={() => onAddClick(date)}
                className="p-1 rounded text-foreground/30 hover:text-[#2383e2] hover:bg-[#2383e2]/10 transition"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="ml-14 space-y-1.5">
              {dayEvts.map(ev => {
                const c = EVENT_COLORS[ev.color];
                return (
                  <button
                    key={ev.id}
                    onClick={() => onEventClick(ev)}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border ${c.bg} ${c.border} hover:opacity-80 transition-opacity group`}
                  >
                    <div className={`w-0.5 self-stretch rounded-full ${c.dot} shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] font-medium ${c.text}`}>{ev.title}</div>
                      {!ev.allDay && ev.startTime && (
                        <div className="text-[11px] text-foreground/40 mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ""}
                        </div>
                      )}
                      {ev.allDay && <div className="text-[11px] text-foreground/40 mt-0.5">All day</div>}
                      {ev.location && (
                        <div className="text-[11px] text-foreground/40 mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {ev.location}
                        </div>
                      )}
                      {ev.description && (
                        <div className="text-[11px] text-foreground/40 mt-1 line-clamp-1">{ev.description}</div>
                      )}
                      {ev.tags && ev.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {ev.tags.map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/5 text-foreground/40">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── MAIN CALENDAR COMPONENT ────────────────────────────────────────────────────
export function NotionCalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [day, setDay] = useState(now.getDate());
  const [view, setView] = useState<ViewMode>("month");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEventDate, setNewEventDate] = useState<string | undefined>();
  const [, setNewEventTime] = useState<string | undefined>();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [showModal, setShowModal] = useState(false);

  const today = useMemo(() => todayStr(), []);

  // Fetch events from MongoDB on mount
  useEffect(() => {
    let cancelled = false;
    getCalendarEvents()
      .then(async (dbEvents) => {
        if (cancelled) return;
        if (dbEvents.length > 0) {
          setEvents(dbEvents as CalendarEvent[]);
        } else {
          // If no events in DB yet, seed initial events to MongoDB
          const seeds = seedEvents();
          setEvents(seeds);
          try {
            for (const s of seeds) {
              const { id: _ignored, ...data } = s;
              await createCalendarEvent(data);
            }
          } catch {
            // Non-critical
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load calendar events:", err);
        if (!cancelled) setEvents(seedEvents());
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const goToToday = () => {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth());
    setDay(n.getDate());
  };

  const navigate = useCallback((dir: -1 | 1) => {
    if (view === "month") {
      const d = new Date(year, month + dir, 1);
      setYear(d.getFullYear());
      setMonth(d.getMonth());
    } else if (view === "week") {
      const d = new Date(year, month, day + dir * 7);
      setYear(d.getFullYear());
      setMonth(d.getMonth());
      setDay(d.getDate());
    } else if (view === "day") {
      const d = new Date(year, month, day + dir);
      setYear(d.getFullYear());
      setMonth(d.getMonth());
      setDay(d.getDate());
    }
  }, [view, year, month, day, setYear, setMonth, setDay]);

  const openNewEvent = (date?: string, time?: string) => {
    setNewEventDate(date);
    setNewEventTime(time);
    setEditingEvent(undefined);
    setShowModal(true);
  };

  const openEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const saveEvent = async (event: CalendarEvent) => {
    // Optimistic UI update
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === event.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = event;
        return next;
      }
      return [...prev, event];
    });

    try {
      const isExistingDbId = event.id && !event.id.startsWith("evt-") && !/^\d+$/.test(event.id);
      if (isExistingDbId) {
        const updated = await updateCalendarEvent(event.id, {
          title: event.title,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          allDay: event.allDay,
          color: event.color,
          description: event.description,
          location: event.location,
          tags: event.tags,
          attendees: event.attendees,
        });
        setEvents(prev => prev.map(e => e.id === event.id ? (updated as CalendarEvent) : e));
        toast.success("Event updated");
      } else {
        const created = await createCalendarEvent({
          title: event.title,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          allDay: event.allDay,
          color: event.color,
          description: event.description,
          location: event.location,
          tags: event.tags,
          attendees: event.attendees,
        });
        setEvents(prev => prev.map(e => e.id === event.id ? (created as CalendarEvent) : e));
        toast.success("Event created in calendar");
      }
    } catch (err) {
      console.error("Failed to save calendar event:", err);
      toast.error("Failed to save event to database");
    }
  };

  const deleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    try {
      if (!id.startsWith("evt-") && !/^\d+$/.test(id)) {
        await deleteCalendarEvent(id);
        toast.success("Event deleted");
      }
    } catch (err) {
      console.error("Failed to delete calendar event:", err);
      toast.error("Failed to delete event from database");
    }
  };

  // Title for header
  const headerTitle = useMemo(() => {
    if (view === "month") return `${MONTHS[month]} ${year}`;
    if (view === "week") {
      const start = new Date(year, month, day);
      const dow = start.getDay();
      start.setDate(start.getDate() - dow);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      if (start.getMonth() === end.getMonth()) {
        return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${SHORT_MONTHS[start.getMonth()]} ${start.getDate()} – ${SHORT_MONTHS[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${MONTHS[month]} ${day}, ${year}`;
  }, [view, year, month, day]);

  const eventCountThisMonth = events.filter(e =>
    e.date.startsWith(`${year}-${pad(month + 1)}`)
  ).length;

  const viewButtons: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: "month", icon: <Grid3x3 className="h-3.5 w-3.5" />, label: "Month" },
    { mode: "week",  icon: <Calendar className="h-3.5 w-3.5" />,  label: "Week" },
    { mode: "day",   icon: <List className="h-3.5 w-3.5" />,     label: "Day" },
    { mode: "agenda",icon: <AlignJustify className="h-3.5 w-3.5" />, label: "Agenda" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background text-foreground select-none">

      {/* ── Top toolbar ── */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-foreground/[0.06]">
        {/* Left: nav + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-[12px] font-medium border border-foreground/[0.12] rounded-lg text-foreground/70 hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <h2 className="text-[16px] font-semibold text-foreground tracking-tight">{headerTitle}</h2>
          {eventCountThisMonth > 0 && (
            <span className="text-[11px] text-foreground/40 font-normal">
              {eventCountThisMonth} event{eventCountThisMonth !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Right: view switcher + new event */}
        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-foreground/[0.04] rounded-lg p-0.5 gap-0.5">
            {viewButtons.map(({ mode, icon, label }) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                title={label}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                  view === mode
                    ? "bg-background shadow-sm text-foreground"
                    : "text-foreground/50 hover:text-foreground"
                }`}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* New event */}
          <button
            onClick={() => openNewEvent(today)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2383e2] hover:bg-[#1a73d8] text-white text-[12px] font-medium transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            New event
          </button>
        </div>
      </div>

      {/* ── Calendar body ── */}
      {view === "month" && (
        <MonthView
          year={year}
          month={month}
          events={events}
          today={today}
          onDayClick={date => openNewEvent(date)}
          onEventClick={openEditEvent}
        />
      )}
      {view === "week" && (
        <WeekView
          year={year}
          month={month}
          day={day}
          events={events}
          today={today}
          onSlotClick={(date, time) => openNewEvent(date, time)}
          onEventClick={openEditEvent}
        />
      )}
      {(view === "day") && (
        <WeekView
          year={year}
          month={month}
          day={day}
          events={events}
          today={today}
          onSlotClick={(date, time) => openNewEvent(date, time)}
          onEventClick={openEditEvent}
        />
      )}
      {view === "agenda" && (
        <AgendaView
          events={events}
          today={today}
          onEventClick={openEditEvent}
          onAddClick={date => openNewEvent(date)}
        />
      )}

      {/* ── New / Edit Event Modal ── */}
      {showModal && (
        <EventModal
          event={editingEvent}
          defaultDate={newEventDate}
          onSave={saveEvent}
          onDelete={deleteEvent}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
