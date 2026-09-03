import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import AgentMemory from "@/lib/models/agent-memory";
import AgentSession from "@/lib/models/agent-session";
import AgentActionLog from "@/lib/models/agent-action-log";

const PYTHON_RAG_SERVICE_URL = (process.env.RAG_SERVICE_URL || "http://127.0.0.1:8000").replace("localhost", "127.0.0.1");
const NEXTJS_BASE_URL = (process.env.NEXTAUTH_URL || "http://127.0.0.1:3000").replace("localhost", "127.0.0.1");
const RAW_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const GEMINI_API_KEY = RAW_KEY.replace(/^["'"']|["'"']$/g, "").trim();

const SESSION_COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function extractSessionToken(request: NextRequest): string {
  const fullCookie = request.headers.get("cookie");
  if (fullCookie) return fullCookie;

  for (const name of SESSION_COOKIE_NAMES) {
    const value = request.cookies.get(name)?.value;
    if (value) return value;
  }
  return "";
}

interface IncomingBody {
  message?: string;
  sessionId?: string;
  personaId?: string;
  history?: Array<{ role: string; text: string }>;
  mode?: "fast" | "think" | "deepsearch";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as IncomingBody | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { message, sessionId, personaId = "project_hr", history, mode = "fast" } = body;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Fetch persistent user memories to supply to LangChain agent
    const userMemories = await AgentMemory.find({ userId: session.user.email })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const memoryStrings = userMemories.map((m) => m.content);

    const sessionToken = extractSessionToken(request);

    // 2. Query Python LangChain Microservice
    let data: any = null;
    try {
      const agentRes = await fetch(`${PYTHON_RAG_SERVICE_URL}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          sessionToken,
          nextjsBaseUrl: NEXTJS_BASE_URL,
          workspaceId: session.user.email,
          geminiApiKey: GEMINI_API_KEY,
          history: Array.isArray(history) ? history.slice(-12) : [],
          persona: personaId,
          memories: memoryStrings,
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (agentRes.ok) {
        data = await agentRes.json().catch(() => null);
      } else {
        const errText = await agentRes.text().catch(() => "Unknown error");
        console.error("[/api/ai/agent] Python agent error:", agentRes.status, errText);
      }
    } catch (fetchErr) {
      console.warn("[/api/ai/agent] Python service unreachable:", fetchErr);
    }

    const answer = data?.answer || "I received your request. Start the Python RAG service (`npm run dev`) to enable autonomous workspace actions.";
    const toolCalls = Array.isArray(data?.toolCalls) ? data.toolCalls : [];

    // 3. Log actions into AgentActionLog for Change History & Audit Trail
    for (const tc of toolCalls) {
      try {
        const toolName = tc.tool;
        if (
          [
            "create_calendar_event",
            "update_calendar_event",
            "delete_calendar_event",
            "create_page",
            "update_page",
            "remember_fact",
          ].includes(toolName)
        ) {
          await AgentActionLog.create({
            userId: session.user.email,
            actionType: toolName,
            entityTitle: tc.output ? String(tc.output).slice(0, 100) : toolName,
            details: tc.output || tc.input,
            metadata: { input: tc.input },
          });
        }
      } catch (logErr) {
        console.error("[/api/ai/agent] Failed to log action:", logErr);
      }
    }

    // 4. Save messages to persistent AgentSession
    let currentSessionId = sessionId;
    try {
      const userMsg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: "user" as const,
        text: message.trim(),
        mode,
        timestamp: new Date(),
      };

      const assistantMsg = {
        id: `msg-${Date.now() + 1}-${Math.random().toString(36).slice(2, 7)}`,
        role: "assistant" as const,
        text: answer,
        toolCalls,
        mode,
        timestamp: new Date(),
      };

      if (currentSessionId) {
        await AgentSession.findOneAndUpdate(
          { _id: currentSessionId, userId: session.user.email },
          {
            $push: { messages: { $each: [userMsg, assistantMsg] } },
            $set: { lastMessageAt: new Date(), personaId },
          }
        );
      } else {
        // Create auto-titled session based on first user message
        const titleSnippet = message.trim().slice(0, 35) + (message.trim().length > 35 ? "…" : "");
        const newSession = await AgentSession.create({
          userId: session.user.email,
          title: titleSnippet || "New Chat",
          personaId,
          messages: [userMsg, assistantMsg],
          lastMessageAt: new Date(),
        });
        currentSessionId = newSession._id.toString();
      }
    } catch (sessionErr) {
      console.error("[/api/ai/agent] Failed to save session:", sessionErr);
    }

    return NextResponse.json({
      answer,
      toolCalls,
      sessionId: currentSessionId,
      source: "agent",
    });
  } catch (error) {
    const err = error as Error;
    console.error("[/api/ai/agent] Unexpected error:", err);
    return NextResponse.json({ error: "Failed to process agent request" }, { status: 500 });
  }
}
