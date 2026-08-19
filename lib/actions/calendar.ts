/**
 * lib/actions/calendar.ts
 *
 * Client-side fetch wrappers for the /api/calendar endpoints.
 */

export interface CalendarEventItem {
  _id?: string;
  id?: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  color: "blue" | "red" | "green" | "yellow" | "purple" | "pink" | "orange" | "gray";
  description?: string;
  location?: string;
  allDay?: boolean;
  tags?: string[];
  attendees?: string[];
}

export async function getCalendarEvents(): Promise<CalendarEventItem[]> {
  const res = await fetch("/api/calendar", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch calendar events");
  const data = await res.json();
  return (data.events || []).map((e: { _id: string }) => ({
    ...e,
    id: e._id,
  }));
}

export async function createCalendarEvent(event: Omit<CalendarEventItem, "_id" | "id">): Promise<CalendarEventItem> {
  const res = await fetch("/api/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create event");
  }
  const data = await res.json();
  return { ...data.event, id: data.event._id };
}

export async function updateCalendarEvent(id: string, updates: Partial<CalendarEventItem>): Promise<CalendarEventItem> {
  const res = await fetch(`/api/calendar/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update event");
  }
  const data = await res.json();
  return { ...data.event, id: data.event._id };
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const res = await fetch(`/api/calendar/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete event");
  }
}
