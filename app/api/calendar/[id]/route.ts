import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import CalendarEvent from "@/lib/models/calendar-event";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/calendar/[id] — update an existing calendar event
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, date, startTime, endTime, color, description, location, allDay, tags, attendees } = body;

    const $set: Record<string, unknown> = {};
    if (title !== undefined) $set.title = String(title).trim();
    if (date !== undefined) $set.date = String(date).trim();
    if (startTime !== undefined) $set.startTime = startTime;
    if (endTime !== undefined) $set.endTime = endTime;
    if (color !== undefined) $set.color = color;
    if (description !== undefined) $set.description = description;
    if (location !== undefined) $set.location = location;
    if (allDay !== undefined) $set.allDay = Boolean(allDay);
    if (tags !== undefined) $set.tags = Array.isArray(tags) ? tags : [];
    if (attendees !== undefined) $set.attendees = Array.isArray(attendees) ? attendees : [];

    await connectToDatabase();
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: id, userId: session.user.email },
      { $set },
      { returnDocument: "after", lean: true }
    );

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return NextResponse.json({ error: "Failed to update calendar event" }, { status: 500 });
  }
}

// DELETE /api/calendar/[id] — delete a calendar event
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await connectToDatabase();
    const result = await CalendarEvent.deleteOne({ _id: id, userId: session.user.email });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return NextResponse.json({ error: "Failed to delete calendar event" }, { status: 500 });
  }
}
