import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import CalendarEvent from "@/lib/models/calendar-event";

// GET /api/calendar — fetch all events for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const events = await CalendarEvent.find({ userId: session.user.email })
      .sort({ date: 1, startTime: 1 })
      .lean();

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 });
  }
}

// POST /api/calendar — create a new calendar event
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { title, date, startTime, endTime, color, description, location, allDay, tags, attendees } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!date || typeof date !== "string") {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    await connectToDatabase();
    const event = await CalendarEvent.create({
      userId: session.user.email,
      title: title.trim(),
      date: date.trim(),
      startTime: startTime || "",
      endTime: endTime || "",
      color: color || "blue",
      description: description || "",
      location: location || "",
      allDay: Boolean(allDay),
      tags: Array.isArray(tags) ? tags : [],
      attendees: Array.isArray(attendees) ? attendees : [],
    });

    return NextResponse.json({ event: event.toObject() }, { status: 201 });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 500 });
  }
}
