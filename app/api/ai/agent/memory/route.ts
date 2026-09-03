import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import AgentMemory from "@/lib/models/agent-memory";

// GET /api/ai/agent/memory — get user's persistent memories
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const memories = await AgentMemory.find({ userId: session.user.email })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ memories });
  } catch (error) {
    console.error("[/api/ai/agent/memory GET]", error);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

// POST /api/ai/agent/memory — add a new memory
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { content, category, importance, source } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Memory content is required" }, { status: 400 });
    }

    await connectToDatabase();
    const memory = await AgentMemory.create({
      userId: session.user.email,
      content: content.trim(),
      category: category || "general",
      importance: typeof importance === "number" ? importance : 1,
      source: source || "user",
    });

    return NextResponse.json({ memory: memory.toObject() }, { status: 201 });
  } catch (error) {
    console.error("[/api/ai/agent/memory POST]", error);
    return NextResponse.json({ error: "Failed to create memory" }, { status: 500 });
  }
}

// DELETE /api/ai/agent/memory?id=... — delete a memory
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid memory id is required" }, { status: 400 });
    }

    await connectToDatabase();
    const result = await AgentMemory.deleteOne({ _id: id, userId: session.user.email });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/ai/agent/memory DELETE]", error);
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}
