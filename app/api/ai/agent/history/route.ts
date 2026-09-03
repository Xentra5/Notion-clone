import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import AgentActionLog from "@/lib/models/agent-action-log";

// GET /api/ai/agent/history — fetch recent agent actions
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const actions = await AgentActionLog.find({ userId: session.user.email })
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();

    return NextResponse.json({ actions });
  } catch (error) {
    console.error("[/api/ai/agent/history GET]", error);
    return NextResponse.json({ error: "Failed to fetch action history" }, { status: 500 });
  }
}
