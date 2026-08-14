import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8000";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.transcript !== "string") {
    return NextResponse.json({ error: "Missing transcript" }, { status: 400 });
  }

  const { transcript, title = "Meeting" } = body as { transcript: string; title?: string };

  // ── Try FastAPI RAG service first ─────────────────────────────────────────
  try {
    const ragRes = await fetch(`${RAG_SERVICE_URL}/meeting-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, title, geminiApiKey: GEMINI_API_KEY }),
      signal: AbortSignal.timeout(30_000),
    });
    if (ragRes.ok) {
      const data = await ragRes.json();
      return NextResponse.json(data);
    }
  } catch {
    // FastAPI not running — fall through to direct Gemini call
  }

  // ── Direct Gemini fallback ────────────────────────────────────────────────
  if (!GEMINI_API_KEY) {
    return NextResponse.json({
      summary: "AI summarization unavailable. Ensure the RAG service is running or set GEMINI_API_KEY in .env.",
      keyDecisions: [],
      actionItems: [],
      topics: [],
    });
  }

  try {
    const SYSTEM = `You are an expert meeting note-taker. Given the raw transcript of a meeting, output EXACTLY the following JSON structure (no markdown, no code fences, just raw JSON):
{
  "summary": "<2-4 sentence plain-english summary of the full meeting>",
  "keyDecisions": ["<decision 1>", "<decision 2>"],
  "actionItems": ["<action item 1>", "<action item 2>"],
  "topics": ["<topic 1>", "<topic 2>", "<topic 3>"]
}
Rules:
- summary: concise, describe what was discussed and concluded.
- keyDecisions: concrete decisions made. Max 5.
- actionItems: tasks someone needs to do. Max 6.
- topics: short keyword labels for subjects. Max 6.
- ONLY output valid JSON.`;

    const prompt = `${SYSTEM}\n\nMeeting Title: ${title}\n\nFull Transcript:\n${transcript}`;
    const cleanKey = GEMINI_API_KEY.replace(/^["']|["']$/g, "").trim();
    const model = "gemini-2.5-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("[meeting-summary direct-gemini error]", errText);
      throw new Error(`Gemini API failed with status ${response.status}`);
    }

    const data = await response.json();
    let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    // Strip markdown fences if model added them
    if (raw.startsWith("```")) {
      raw = raw.split("```")[1];
      if (raw.startsWith("json")) raw = raw.slice(4);
      raw = raw.trim();
    }
    if (raw.endsWith("```")) raw = raw.slice(0, -3).trim();

    const parsed = JSON.parse(raw) as {
      summary?: string;
      keyDecisions?: string[];
      actionItems?: string[];
      topics?: string[];
    };
    return NextResponse.json({
      summary: parsed.summary ?? "",
      keyDecisions: parsed.keyDecisions ?? [],
      actionItems: parsed.actionItems ?? [],
      topics: parsed.topics ?? [],
    });
  } catch (err) {
    console.error("[meeting-summary direct-gemini error]", err);
    return NextResponse.json({
      summary: "Could not generate summary. Please try again.",
      keyDecisions: [],
      actionItems: [],
      topics: [],
    });
  }
}
