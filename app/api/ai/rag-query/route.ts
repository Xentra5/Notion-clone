import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/lib/models/page";

const PYTHON_RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8000";
const RAW_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const GEMINI_API_KEY = RAW_KEY.replace(/^["']|["']$/g, "").trim();

// Types for page/block shapes returned by Mongoose lean()
interface RawBlock {
  id: string;
  type: string;
  properties?: { text?: string };
}
interface RawPage {
  _id: { toString(): string };
  title?: string;
  blocks?: RawBlock[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { question, pageId, pageTitle, pageContent, history } = body as {
      question?: unknown;
      pageId?: unknown;
      pageTitle?: unknown;
      pageContent?: unknown;
      history?: { role: "user" | "assistant"; text: string }[];
    };

    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const q = question.trim();
    const activePageId = typeof pageId === "string" && pageId.trim() ? pageId.trim() : null;
    const providedTitle = typeof pageTitle === "string" && pageTitle.trim() ? pageTitle.trim() : "";
    const providedContent = typeof pageContent === "string" && pageContent.trim() ? pageContent.trim() : "";

    // Fetch user's active workspace pages for in-memory fallback & indexing
    await connectToDatabase();
    const pages = (await Page.find({
      userId: session.user.email,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    }).lean()) as RawPage[];

    const workspaceId = session.user.email;
    // Batch index in the background without flooding parallel requests
    if (pages.length > 0) {
      void fetch(`${PYTHON_RAG_SERVICE_URL}/index-pages-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          pages: pages.map((p) => ({
            workspaceId,
            pageId: p._id.toString(),
            title: p.title || "Untitled",
            blocks: (p.blocks || []).map((b: RawBlock) => ({
              id: b.id,
              type: b.type,
              text: b.properties?.text || "",
            })),
          })),
        }),
        signal: AbortSignal.timeout(10000),
      }).catch(() => null);
    }

    // ─── Build workspace & conversation context (used by slash cmds AND fallback) ───
    const pageTitles = pages.map((p) => p.title || "Untitled");
    const pageCount  = pages.length;
    const contentCount = pages.reduce(
      (total, page) => total + (page.blocks || []).filter((block) => Boolean(block.properties?.text?.trim())).length,
      0
    );
    const workspaceContext = pages
      .map((p) => {
        const textBlocks = (p.blocks || [])
          .filter((b: RawBlock) => b.properties?.text)
          .map((b: RawBlock) => b.properties?.text || "")
          .join(" ")
          .slice(0, 300);
        return `Page: "${p.title || "Untitled"}"\nContent: ${textBlocks || "(empty)"}`;
      })
      .join("\n\n");
    const conversationContext = Array.isArray(history)
      ? history.slice(-12).map((turn) => `${turn.role}: ${turn.text}`).join("\n")
      : "";

    // ─── Slash command detection ─────────────────────────────────────────────────
    // Slash commands are ALWAYS handled in-process (not by the Python RAG service)
    const isSummaryCmd =
      /^\/(summary|summery|summarize)\b/i.test(q) ||
      /^(summarize(\s+this\s+page|\s+page|\s+note|\s+workspace)?|summary)$/i.test(q);
    const isSlashCommand =
      isSummaryCmd ||
      /^\/(write|code|kanban|table|search)\b/i.test(q);

    // ─── Normal Q&A: try Python RAG service first ────────────────────────────────
    if (!isSlashCommand) {
      try {
        const ragRes = await fetch(`${PYTHON_RAG_SERVICE_URL}/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            pageId: typeof pageId === "string" ? pageId : undefined,
            question: q,
            history: Array.isArray(history) ? history.slice(-12) : [],
            geminiApiKey: GEMINI_API_KEY,
          }),
          signal: AbortSignal.timeout(8000),
        });

        if (ragRes.ok) {
          const data = await ragRes.json() as { answer?: unknown; citations?: unknown; source?: string; action?: "append_block"; content?: string };
          if (typeof data.answer === "string") {
            return NextResponse.json({
              answer: data.answer,
              citations: Array.isArray(data.citations) ? data.citations : [],
              source: data.source || "rag",
              action: data.action,
              content: data.content,
            });
          }
        }
      } catch {
        // Python service not running: use the in-process Gemini fallback below.
      }
    }

    // /write command
    if (q.toLowerCase().startsWith("/write")) {
      const instruction = q.slice(6).trim();
      if (!instruction) {
        return NextResponse.json({
          answer: "Tell me what to write after `/write`, for example: `/write Explain binary search`.",
          citations: [],
          source: "write_help",
        });
      }

      const content = GEMINI_API_KEY
        ? await callGemini(
            `You are a Notion writing assistant. Create clean, useful content for the user's active page. Return only the content to append, without commentary.\n\nPrevious conversation:\n${conversationContext || "(none)"}\n\nUser instruction: ${instruction}\n\nWorkspace context:\n${workspaceContext}`,
            GEMINI_API_KEY
          )
        : instruction;

      return NextResponse.json({
        answer: `✍️ **Content written to active page**\n\n${content}`,
        citations: [],
        source: "agent_write",
        action: "append_block",
        blockType: "paragraph",
        content,
      });
    }

    // /code command
    if (q.toLowerCase().startsWith("/code")) {
      const instruction = q.slice(5).trim();
      if (!instruction) {
        return NextResponse.json({
          answer: "Tell me what code to create after `/code`, for example: `/code React button with loading state`.",
          citations: [],
          source: "code_help",
        });
      }
      const codeAnswer = GEMINI_API_KEY
        ? await callGemini(
            `You are an expert programming assistant. Answer the user's request with a concise explanation and a complete, well-formatted code block wrapped in \`\`\`language ... \`\`\`.\n\nPrevious conversation:\n${conversationContext || "(none)"}\n\nUser request: ${instruction}`,
            GEMINI_API_KEY
          )
        : "AI code generation needs a Gemini API key.";

      // Extract code snippet and language for page block append
      const langMatch = /```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/.exec(codeAnswer);
      const codeContent = langMatch ? langMatch[2].trim() : codeAnswer;
      const codeLang = langMatch?.[1]?.trim() || "code";

      return NextResponse.json({
        answer: codeAnswer,
        citations: [],
        source: "code",
        action: "append_block",
        blockType: "code",
        content: codeContent,
        language: codeLang,
      });
    }

    // /kanban command
    if (q.toLowerCase().startsWith("/kanban")) {
      const title = q.slice(7).trim() || "Project Workspace Kanban";
      return NextResponse.json({
        answer: `🗄️ **Kanban Board created in active page**\n\nInteractive board: **${title}**`,
        citations: [],
        source: "kanban",
        action: "append_block",
        blockType: "kanban",
        content: title,
      });
    }

    // /table command
    if (q.toLowerCase().startsWith("/table")) {
      const title = q.slice(6).trim() || "Workspace Matrix Table";
      return NextResponse.json({
        answer: `📊 **Matrix Table created in active page**\n\nData Table: **${title}**`,
        citations: [],
        source: "table",
        action: "append_block",
        blockType: "table",
        content: title,
      });
    }

    // /search command
    if (q.toLowerCase().startsWith("/search")) {
      const term = q.slice(7).trim();
      if (!term) {
        return NextResponse.json({
          answer: "Please provide a search term. Example: `/search Next.js 16`",
          citations: [],
        });
      }

      if (GEMINI_API_KEY) {
        const geminiAnswer = await callGemini(
          `You are a web search assistant. Provide a detailed, accurate answer about: "${term}". Format your response with clear headings and bullet points. Include relevant facts, features, and context.`,
          GEMINI_API_KEY
        );
        return NextResponse.json({
          answer: `🌐 **Web Search: "${term}"**\n\n${geminiAnswer}`,
          citations: [],
          source: "gemini_search",
          action: "append_block",
          blockType: "paragraph",
          content: geminiAnswer,
        });
      }

      return NextResponse.json({
        answer: `🌐 **Web Search Results for "${term}":**\n\n• Start the Python RAG service for live DuckDuckGo web search results.\n• Or add GEMINI_API_KEY to your .env.local for instant AI-powered search.`,
        citations: [],
      });
    }

    // /summary / /summery / /summarize command
    if (isSummaryCmd) {
      // Find database active page if activePageId was provided
      const activePage = activePageId ? pages.find((p) => p._id.toString() === activePageId) : null;
      const targetTitle = providedTitle || activePage?.title || "Active Page";

      // 1. Prioritize live pageContent passed from client editor
      let pageText = providedContent;

      // 2. Fall back to database blocks for activePage if client didn't pass content
      if (!pageText && activePage) {
        pageText = (activePage.blocks || [])
          .filter((b: RawBlock) => Boolean(b.properties?.text?.trim()))
          .map((b: RawBlock) => b.properties?.text || "")
          .join("\n");
      }

      // If active page has content, summarize it directly
      if (pageText.trim()) {
        if (GEMINI_API_KEY) {
          const geminiAnswer = await callGemini(
            `You are Notion AI, an expert workspace assistant. Write a comprehensive, well-structured executive summary of the following note with clear sections:

## 📌 Executive Summary
(2-3 clear sentences summarizing the core idea)

## 🔑 Key Points & Highlights
(bullet points of key information)

## ✅ Action Items & Next Steps
(extracted or suggested action items, or "None specified")

## 💡 Key Insights & Takeaways
(concluding thoughts or recommendations)

Page Title: "${targetTitle}"
Page Content:
${pageText.slice(0, 10000)}`,
            GEMINI_API_KEY
          );
          return NextResponse.json({
            answer: `📝 **Page Summary: "${targetTitle}"**\n\n${geminiAnswer}`,
            citations: activePage ? [{ pageId: activePage._id.toString(), title: targetTitle }] : [],
            source: "gemini_summary",
          });
        }

        // Local summary without API key
        const lines = pageText.split("\n").map((l) => l.trim()).filter(Boolean);
        const wordCount = pageText.split(/\s+/).filter(Boolean).length;
        const excerpt = lines.slice(0, 8).map((l) => `• ${l}`).join("\n");
        return NextResponse.json({
          answer: `📝 **Page Summary: "${targetTitle}"** (${wordCount} words)\n\n## 📌 Highlights\n${excerpt}${lines.length > 8 ? "\n\n*(and more)*" : ""}\n\n💡 *Tip: Add GEMINI_API_KEY to your .env.local file for deep AI-generated insights.*`,
          citations: activePage ? [{ pageId: activePage._id.toString(), title: targetTitle }] : [],
          source: "local_summary",
        });
      }

      // 3. If active page has no text, check if workspace has other pages with content
      if (contentCount > 0 && pageCount > 0) {
        if (GEMINI_API_KEY) {
          const geminiAnswer = await callGemini(
            `You are Notion AI. Based on these workspace pages, write a concise workspace executive summary:
## 📌 Key Topics
## ✅ Action Items
## 💡 Key Insights

Previous conversation:
${conversationContext || "(none)"}

Workspace pages:
${workspaceContext}`,
            GEMINI_API_KEY
          );
          return NextResponse.json({
            answer: `📝 **Workspace Executive Summary** (${pageCount} pages)\n\n${geminiAnswer}`,
            citations: pages.slice(0, 4).map((p) => ({ pageId: p._id.toString(), title: p.title || "Untitled" })),
            source: "gemini_summary",
          });
        }

        return NextResponse.json({
          answer: `📝 **Workspace Summary** (${pageCount} pages)\n\nYour workspace contains: **${pageTitles.join(", ")}**.\n\n💡 Add a GEMINI_API_KEY to .env.local for AI-powered summaries, or start the Python RAG service.`,
          citations: pages.slice(0, 4).map((p) => ({ pageId: p._id.toString(), title: p.title || "Untitled" })),
        });
      }

      // 4. Truly empty page and empty workspace
      return NextResponse.json({
        answer: `📄 **"${targetTitle}"** has no written content yet.\n\nStart typing notes on the page, then ask \`/summary\` again!`,
        citations: [],
        source: "empty_page",
      });
    }

    // Normal Q&A with Gemini — strictly workspace-grounded
    if (GEMINI_API_KEY) {
      // If the workspace has no relevant content, skip Gemini and give a helpful redirect
      if (contentCount === 0) {
        return NextResponse.json({
          answer: `🔍 I don't have enough context in your workspace pages to answer **"${q}"**.\n\n💡 Try:\n- **\`/search ${q}\`** — live web search\n- **\`/write ${q}\`** — have AI write content about it directly to this page\n- Add notes about this topic to your workspace first.`,
          citations: [],
          source: "out_of_context",
        });
      }

      const geminiAnswer = await callGemini(
        `You are Notion AI, a workspace assistant. You ONLY answer questions using the workspace notes below.
If the question cannot be answered from the workspace content, respond EXACTLY with:
"🔍 I don't have notes on this in your workspace. Try \`/search ${q}\` to search the web."
Do NOT answer general knowledge questions. Do NOT make up or generate information.

Previous conversation:
${conversationContext || "(none)"}

Workspace pages (${pageCount} pages):
${workspaceContext}

User question: ${q}`,
        GEMINI_API_KEY
      );
      return NextResponse.json({
        answer: geminiAnswer,
        citations: [],
        source: "gemini_rag",
      });
    }

    // No API key, no Python service — clear instructions
    return NextResponse.json({
      answer: `⚠️ **RAG Service Not Configured**\n\nTo enable AI responses:\n\n1. **Quick**: Add \`GEMINI_API_KEY=your_key\` to \`.env.local\`\n2. **Full RAG**: Start the Python service:\n   \`\`\`\n   rag_service\\venv\\Scripts\\python -m uvicorn main:app --reload --port 8000 --app-dir rag_service\n   \`\`\``,
      citations: [],
    });
  } catch (error) {
    console.error("RAG query route error:", error);
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 });
  }
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const cleanKey = apiKey.replace(/^["']|["']$/g, "").trim();
  if (!cleanKey || cleanKey === "your-gemini-api-key-here") {
    return "⚠️ Please set a valid GEMINI_API_KEY in your .env file (get one free at https://aistudio.google.com/app/apikey).";
  }

  const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"];
  let lastError = "";

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
          signal: AbortSignal.timeout(15000),
        }
      );

      const data = (await res.json().catch(() => ({}))) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
        error?: { message?: string; code?: number };
      };

      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }

      if (!res.ok) {
        console.error(`Gemini API model ${model} failed (${res.status}):`, data.error?.message || res.statusText);
        lastError = data.error?.message || `HTTP ${res.status}`;
      }
    } catch (error) {
      console.error(`Gemini API error for model ${model}:`, error);
    }
  }

  return `⚠️ Gemini API request failed (${lastError || "404 Not Found"}). Please check your GEMINI_API_KEY in .env (must start with 'AIzaSy...'). Get a key at https://aistudio.google.com/app/apikey`;
}
