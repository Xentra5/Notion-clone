import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { checkRateLimit } from "@/lib/ratelimit";
import { cleanAiText } from "@/lib/clean-ai-text";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/user";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const RAG_SERVICE_URL = (process.env.RAG_SERVICE_URL || "http://127.0.0.1:8000").replace(
  "localhost",
  "127.0.0.1"
);
const RAG_INTERNAL_SECRET = process.env.RAG_INTERNAL_SECRET || "";

interface InlineRequestBody {
  action: "transform" | "generate" | "autocomplete";
  text?: string;
  prompt?: string;
  transformation?:
    | "improve"
    | "fix_spelling"
    | "shorter"
    | "longer"
    | "summarize"
    | "tone"
    | "translate"
    | "custom";
  tone?: string;
  language?: string;
  pageTitle?: string;
  pageContext?: string;
  currentText?: string;
  precedingText?: string;
}

/**
 * Call Google Gemini REST API directly
 */
async function callGemini(prompt: string, maxTokens = 1200, temperature = 0.3): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  const cleanKey = GEMINI_API_KEY.replace(/^["']|["']$/g, "").trim();
  const model = "gemini-2.5-flash";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      cleanKey
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature,
        },
      }),
      signal: AbortSignal.timeout(25000),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return cleanAiText(rawText);
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limiting: 45 requests/min per IP
    const rl = await checkRateLimit(request, "ai_inline", { limit: 45, windowMs: 60_000 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    const body = (await request.json().catch(() => null)) as InlineRequestBody | null;
    if (!body || !body.action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    // 3. User quota check for generate and transform (autocomplete is lightweight)
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (user && user.plan === "free" && body.action !== "autocomplete") {
      const usage = user.aiUsageCount || 0;
      if (usage >= 3) {
        return NextResponse.json(
          {
            error: "You have reached your 3 free AI queries on the Free tier. Upgrade to Pro for unlimited AI.",
            quotaExceeded: true,
          },
          { status: 403 }
        );
      }
    }

    // 4. Handle Actions
    if (body.action === "autocomplete") {
      const current = (body.currentText || "").trim();
      const preceding = (body.precedingText || "").trim();
      const title = (body.pageTitle || "Untitled").trim();

      if (!current || current.length < 5) {
        return NextResponse.json({ completion: "" });
      }

      const prompt = `You are a high-speed Ghostwriter AI autocomplete engine for a collaborative workspace.
Document Title: "${title}"
Context before: "${preceding.slice(-300)}"
Current sentence so far: "${current}"

TASK: Predict and continue the current sentence or thought naturally with 1 short, coherent phrase or sentence (5-18 words max).
RULES:
- ONLY output the continuation text that immediately follows after "${current}".
- DO NOT repeat what the user already typed.
- DO NOT include quotes, explanations, markdown formatting, or multiple paragraphs.
- Keep it natural, professional, and directly relevant.`;

      try {
        const rawCompletion = await callGemini(prompt, 60, 0.2);
        let completion = rawCompletion.trim();

        // Strip leading whitespace or quotes if model added them
        completion = completion.replace(/^["'`\s]+|["'`\s]+$/g, "");
        if (completion.toLowerCase().startsWith(current.toLowerCase())) {
          completion = completion.slice(current.length).trim();
        }

        return NextResponse.json({ completion });
      } catch (err) {
        console.warn("[/api/ai/inline autocomplete error]", err);
        return NextResponse.json({ completion: "" });
      }
    }

    if (body.action === "transform") {
      const text = (body.text || "").trim();
      if (!text) {
        return NextResponse.json({ error: "Text to transform is required." }, { status: 400 });
      }

      const { transformation = "improve", customPrompt = "", tone = "professional", language = "Spanish" } = body as any;

      let instruction = "";
      switch (transformation) {
        case "improve":
          instruction = "Improve the writing style, clarity, elegance, and sentence flow while preserving original meaning.";
          break;
        case "fix_spelling":
          instruction = "Fix all spelling, punctuation, grammar, and typographical errors. Do NOT change stylistic tone or vocabulary unless necessary.";
          break;
        case "shorter":
          instruction = "Make the text significantly more concise and impactful. Remove all fluff, repetition, and passive phrasing.";
          break;
        case "longer":
          instruction = "Expand this text with rich elaboration, complementary details, helpful context, and natural flow without unnecessary fluff.";
          break;
        case "summarize":
          instruction = "Summarize the key points clearly in 1 concise paragraph or bullet points.";
          break;
        case "tone":
          instruction = `Rewrite this text in a distinct ${tone} tone of voice.`;
          break;
        case "translate":
          instruction = `Accurately translate this text into natural, fluent ${language}. Preserve the formatting and tone.`;
          break;
        case "custom":
          instruction = customPrompt || "Edit and enhance the text according to standard best practices.";
          break;
        default:
          instruction = "Improve and refine the text.";
      }

      const prompt = `You are Notion AI, an expert canvas-level writing assistant.
Instruction: ${instruction}

Original Text:
"""
${text}
"""

OUTPUT RULES:
- Output ONLY the transformed replacement text.
- Do NOT add preamble like "Here is the revised version:" or conversational commentary.
- Preserve any useful inline markdown formatting (bold, italics, code, bullet structure) where appropriate.`;

      const output = await callGemini(prompt, 1200, 0.3);

      // Increment usage count for free users
      if (user && user.plan === "free") {
        await User.updateOne({ _id: user._id }, { $inc: { aiUsageCount: 1 } });
      }

      return NextResponse.json({ output: output.trim() });
    }

    if (body.action === "generate") {
      const userPrompt = (body.prompt || "").trim();
      if (!userPrompt) {
        return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
      }

      const pageTitle = (body.pageTitle || "Untitled").trim();
      const pageContext = (body.pageContext || "").slice(-1200);

      const prompt = `You are Notion AI, embedded directly inside a workspace canvas.
Current Page Title: "${pageTitle}"
${pageContext ? `Current Page Excerpt:\n"""\n${pageContext}\n"""\n` : ""}

User Request: "${userPrompt}"

TASK: Generate high-quality, structured content directly tailored to the request.
RULES:
- Use clean Markdown format (headings #, ##, ###, bullet points -, numbered lists 1., checkboxes [ ], blockquotes >, tables, or code blocks).
- Do NOT output greetings, conversational filler, or self-referential commentary (e.g. "Sure! Here is...").
- Jump straight into the structured content.`;

      const output = await callGemini(prompt, 1800, 0.4);

      // Increment usage count for free users
      if (user && user.plan === "free") {
        await User.updateOne({ _id: user._id }, { $inc: { aiUsageCount: 1 } });
      }

      return NextResponse.json({ output: output.trim() });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    const err = error as Error;
    console.error("[/api/ai/inline] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process AI inline request." },
      { status: 500 }
    );
  }
}
