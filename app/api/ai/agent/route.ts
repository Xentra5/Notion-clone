import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";

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

    const { message, history } = body as { message?: unknown; history?: unknown };

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const sessionToken = extractSessionToken(request);

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
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!agentRes.ok) {
      const errText = await agentRes.text().catch(() => "Unknown error");
      console.error("[/api/ai/agent] Python agent error:", agentRes.status, errText);
      return NextResponse.json(
        { error: "Agent service error", detail: errText },
        { status: 502 }
      );
    }

    const data = await agentRes.json().catch(() => null);
    if (!data) {
      return NextResponse.json({ error: "Invalid agent response" }, { status: 502 });
    }

    return NextResponse.json({
      answer: data.answer || "I processed your request.",
      toolCalls: Array.isArray(data.toolCalls) ? data.toolCalls : [],
      source: "agent",
    });
  } catch (error) {
    const err = error as Error;
    if (err.name === "TimeoutError" || err.message?.includes("fetch")) {
      return NextResponse.json({
        answer:
          "**Agent service is not running.**\n\nStart the Python RAG service to use the AI Agent:\n```\ncd rag_service\nvenv\\Scripts\\python -m uvicorn main:app --reload --port 8000\n```",
        toolCalls: [],
        source: "agent_offline",
      });
    }
    console.error("[/api/ai/agent] Unexpected error:", err);
    return NextResponse.json({ error: "Failed to process agent request" }, { status: 500 });
  }
}
