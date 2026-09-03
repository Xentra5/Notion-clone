import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import AgentSession from "@/lib/models/agent-session";

// GET /api/ai/agent/sessions — list user's agent chat sessions
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const sessions = await AgentSession.find(
      { userId: session.user.email },
      { title: 1, personaId: 1, lastMessageAt: 1, createdAt: 1, updatedAt: 1 }
    )
      .sort({ updatedAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[/api/ai/agent/sessions GET]", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// POST /api/ai/agent/sessions — create a new chat session
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, personaId } = body;

    await connectToDatabase();
    const newSession = await AgentSession.create({
      userId: session.user.email,
      title: (title || "New Chat").trim(),
      personaId: personaId || "project_hr",
      messages: [],
      lastMessageAt: new Date(),
    });

    return NextResponse.json({ session: newSession.toObject() }, { status: 201 });
  } catch (error) {
    console.error("[/api/ai/agent/sessions POST]", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
