import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import AgentSession from "@/lib/models/agent-session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ai/agent/sessions/[id] — get a single chat session with its messages
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
    }

    await connectToDatabase();
    const chatSession = await AgentSession.findOne({
      _id: id,
      userId: session.user.email,
    }).lean();

    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session: chatSession });
  } catch (error) {
    console.error("[/api/ai/agent/sessions/[id] GET]", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

// PATCH /api/ai/agent/sessions/[id] — update session title or persona
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, personaId } = body;

    const $set: Record<string, unknown> = {};
    if (title !== undefined) $set.title = String(title).trim();
    if (personaId !== undefined) $set.personaId = String(personaId).trim();

    await connectToDatabase();
    const updated = await AgentSession.findOneAndUpdate(
      { _id: id, userId: session.user.email },
      { $set },
      { new: true, lean: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error("[/api/ai/agent/sessions/[id] PATCH]", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

// DELETE /api/ai/agent/sessions/[id] — delete a session
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
    }

    await connectToDatabase();
    const res = await AgentSession.deleteOne({ _id: id, userId: session.user.email });

    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/ai/agent/sessions/[id] DELETE]", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
