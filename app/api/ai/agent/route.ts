import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import AgentMemory from "@/lib/models/agent-memory";
import AgentSession from "@/lib/models/agent-session";
import AgentActionLog from "@/lib/models/agent-action-log";
import { checkRateLimit } from "@/lib/ratelimit";

// ─── Service Configuration ────────────────────────────────────────────────────

const PYTHON_RAG_SERVICE_URL = (process.env.RAG_SERVICE_URL || "http://127.0.0.1:8000").replace(
  "localhost",
  "127.0.0.1"
);
const NEXTJS_BASE_URL = (process.env.NEXTAUTH_URL || "http://127.0.0.1:3000").replace(
  "localhost",
  "127.0.0.1"
);

/**
 * Shared internal secret used to authenticate Next.js → Python RAG service calls.
 * Set RAG_INTERNAL_SECRET in both .env and the Python service environment.
 * The Python service MUST reject requests missing this header.
 */
const RAG_INTERNAL_SECRET = process.env.RAG_INTERNAL_SECRET || "";

interface IncomingBody {
  message?: string;
  sessionId?: string;
  personaId?: string;
  history?: Array<{ role: string; text: string }>;
  mode?: "fast" | "think" | "deepsearch";
}

/**
 * Wraps user content in explicit delimiters so the LLM treats it as data,
 * not as additional instructions — mitigates prompt injection.
 */
function sanitizeForPrompt(userInput: string): string {
  return `[USER_INPUT_START]\n${userInput}\n[USER_INPUT_END]`;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limiting — AI agent is expensive; 15 requests/minute per IP
    const rl = await checkRateLimit(request, "ai_agent", { limit: 15, windowMs: 60_000 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    const body = (await request.json().catch(() => null)) as IncomingBody | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { message, sessionId, personaId = "project_hr", history, mode = "fast" } = body;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    // 3. Cap message length to prevent prompt-flooding attacks
    const MAX_MSG_LEN = 4000;
    if (message.length > MAX_MSG_LEN) {
      return NextResponse.json(
        { error: `Message too long (max ${MAX_MSG_LEN} characters)` },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 4. Fetch persistent user memories
    const userMemories = await AgentMemory.find({ userId: session.user.email })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const memoryStrings = userMemories.map((m) => m.content);

    const rawCookie = request.headers.get("cookie") || "";
    const sessionToken =
      rawCookie ||
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value ||
      "";

    // 5. Query Python LangChain Microservice
    //    SECURITY: The Gemini API key is NOT forwarded here — the Python service
    //    reads it directly from its own environment variables. The RAG_INTERNAL_SECRET
    //    authenticates this internal service-to-service call.
    let data: { answer?: string; toolCalls?: unknown[] } | null = null;
    try {
      const agentRes = await fetch(`${PYTHON_RAG_SERVICE_URL}/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Service-to-service authentication header (replaces session cookie forwarding)
          "X-Rag-Internal-Secret": RAG_INTERNAL_SECRET,
          // Scoped identity header — Python agent acts on behalf of this user
          "X-Workspace-Id": session.user.email,
        },
        body: JSON.stringify({
          message: sanitizeForPrompt(message.trim()),
          sessionToken,
          workspaceId: session.user.email,
          nextjsBaseUrl: NEXTJS_BASE_URL,
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

    const answer =
      data?.answer ||
      "I received your request. Start the Python RAG service (`npm run dev`) to enable autonomous workspace actions.";
    const toolCalls = Array.isArray(data?.toolCalls) ? data.toolCalls : [];

    // 6. Log tool calls into AgentActionLog
    for (const tc of toolCalls as { tool?: string; output?: unknown; input?: unknown }[]) {
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
          ].includes(toolName ?? "")
        ) {
          const match = String(tc.output || "").match(/ID:\s*([a-f0-9]+)/i);
          const entityId = match ? match[1] : undefined;
          await AgentActionLog.create({
            userId: session.user.email,
            actionType: toolName,
            entityId,
            entityTitle: tc.output ? String(tc.output).slice(0, 100) : toolName,
            details: tc.output || tc.input,
            metadata: { input: tc.input, entityId },
          });
        }
      } catch (logErr) {
        console.error("[/api/ai/agent] Failed to log action:", logErr);
      }
    }

    // 7. Save messages to persistent AgentSession
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
