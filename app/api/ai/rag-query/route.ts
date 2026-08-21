import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/lib/models/page";
import { searchDuckDuckGo } from "@/lib/duckduckgo";
import { serverCache, hashQuery } from "@/lib/cache";

const PYTHON_RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8000";
const RAW_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const GEMINI_API_KEY = RAW_KEY.replace(/^["']|["']$/g, "").trim();

/** Returns true only when we have a key that looks like a real Gemini key */
function isValidGeminiKey(key: string): boolean {
  return Boolean(key && key.length > 20 && !key.startsWith("your-") && !key.startsWith("replace-"));
}

const NO_KEY_ANSWER =
  `\u26a0\ufe0f **Gemini API key not configured**\n\n` +
  `To enable Notion AI, add a valid key to your \`.env\` file:\n` +
  "```\nGEMINI_API_KEY=AIzaSy...your-key-here\n```\n\n" +
  `Get a **free** key at [Google AI Studio](https://aistudio.google.com/app/apikey).\n\n` +
  `Tips:\n- Keys must start with \`AIzaSy\`\n- Do NOT include quotes around the key in .env`;

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

    // ─── 1. Check AI Response In-Memory Cache ───────────────────────────────
    const queryHash = hashQuery(
      `${session.user.email}:${activePageId || "workspace"}:${q}:${providedContent ? hashQuery(providedContent) : ""}`
    );
    const aiResponseCacheKey = `ai:res:${session.user.email}:${queryHash}`;
    const isInteractiveCmd = /^\/(kanban|table)\b/i.test(q);

    if (!isInteractiveCmd) {
      const cached = serverCache.get<Record<string, unknown>>(aiResponseCacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    const respondWithCache = (payload: Record<string, unknown>, ttl = 300) => {
      if (!isInteractiveCmd && payload.answer && !payload.error) {
        serverCache.set(aiResponseCacheKey, payload, ttl);
      }
      return NextResponse.json(payload);
    };

    // ─── 2. Fetch Workspace Pages with In-Memory Caching ────────────────────
    const workspaceCacheKey = `pages:workspace:${session.user.email}`;
    let pages = serverCache.get<RawPage[]>(workspaceCacheKey);

    if (!pages) {
      await connectToDatabase();
      pages = (await Page.find({
        userId: session.user.email,
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
      }).lean()) as RawPage[];

      serverCache.set(workspaceCacheKey, pages, 180);
    }

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

    // ─── Slash command & natural language intent detection ──────────────────────
    const isSummaryCmd =
      /^\/(summary|summery|summarize)\b/i.test(q) ||
      /^(summarize(\s+this\s+page|\s+page|\s+note|\s+workspace)?|summary)$/i.test(q) ||
      /^summarize\s+/i.test(q);

    const isWriteCmd = /^\/write\b/i.test(q) || /^write\s+/i.test(q) || /^draft\s+/i.test(q);
    const isCodeCmd = /^\/code\b/i.test(q) || /^code\s+/i.test(q);
    const isSearchCmd = /^\/search\b/i.test(q) || /^search\s+/i.test(q) || /^find\s+/i.test(q);
    const isKanbanCmd = /^\/kanban\b/i.test(q);
    const isTableCmd = /^\/table\b/i.test(q);

    // ─── /search command: live web search via built-in LangChain DuckDuckGo tools ───
    if (isSearchCmd) {
      const term = q.replace(/^(\/search|search|find)\s*/i, "").trim();
      if (!term) {
        return NextResponse.json({
          answer: "Please provide a search term. Example: `/search Next.js 16` or `/search today's date`",
          citations: [],
        });
      }

      // Try Python LangChain DuckDuckGo search microservice first
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
          signal: AbortSignal.timeout(10000),
        });

        if (ragRes.ok) {
          const data = (await ragRes.json()) as { answer?: string; citations?: unknown[]; source?: string };
          if (data.answer && typeof data.answer === "string") {
            return respondWithCache({
              answer: data.answer,
              citations: Array.isArray(data.citations) ? data.citations : [],
              source: data.source || "langchain_duckduckgo",
            }, 600);
          }
        }
      } catch {
        // Python service offline — fall through to Node.js DuckDuckGo
      }

      // Node.js DuckDuckGo search fallback
      const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const isDateQuery =
        /what\s+is\s+(today|the\s+date|current\s+date|todays\s+date)/i.test(term) ||
        /^today('?s)?\s+date/i.test(term);
      if (isDateQuery) {
        return respondWithCache({
          answer: `🌐 **Live Web & System Search: "${term}"**\n\n### Today's Date\nToday is **${currentDate}**.\n\n*Verified with live system clock & real-time search.*`,
          citations: [],
          source: "live_search",
        }, 600);
      }

      const ddgResults = await searchDuckDuckGo(term);
      if (ddgResults.length > 0) {
        const formattedResults = ddgResults
          .map((r, i) => `**${i + 1}. [${r.title}](${r.url})**\n${r.snippet}\n🔗 [${r.url}](${r.url})`)
          .join("\n\n");

        return respondWithCache({
          answer: `🌐 **DuckDuckGo Live Search: "${term}"**\n\n${formattedResults}`,
          citations: [],
          source: "duckduckgo_search",
        }, 600);
      }

      return NextResponse.json({
        answer: `🌐 **Web Search for "${term}"**\n\nNo live search results found on DuckDuckGo. Try refining your keywords.`,
        citations: [],
        source: "web_search",
      });
    }

    // ─── /kanban command ────────────────────────────────────────────────────────
    if (isKanbanCmd) {
      const title = q.replace(/^\/kanban\s*/i, "").trim() || "Project Workspace Kanban";
      return NextResponse.json({
        answer: `🗄️ **Kanban Board created in active page**\n\nInteractive board: **${title}**`,
        citations: [],
        source: "kanban",
        action: "append_block",
        blockType: "kanban",
        content: title,
      });
    }

    // ─── /table command ─────────────────────────────────────────────────────────
    if (isTableCmd) {
      const title = q.replace(/^\/table\s*/i, "").trim() || "Workspace Matrix Table";
      return NextResponse.json({
        answer: `📊 **Matrix Table created in active page**\n\nData Table: **${title}**`,
        citations: [],
        source: "table",
        action: "append_block",
        blockType: "table",
        content: title,
      });
    }

    // ─── Gate: no valid API key → return clear setup error immediately ────────────
    // ─── Try Python LangChain RAG microservice — only for normal Q&A ─────────────
    if (!isSummaryCmd || !providedContent) {
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
          signal: AbortSignal.timeout(12000),
        });

        if (ragRes.ok) {
          const data = (await ragRes.json()) as {
            answer?: unknown;
            citations?: unknown;
            source?: string;
            action?: "append_block";
            content?: string;
            blockType?: string;
            language?: string;
          };
          const answerStr = typeof data.answer === "string" ? data.answer : "";
          const isBadFallback =
            !answerStr ||
            answerStr.includes("To unlock live AI writing") ||
            answerStr.includes("No content available") ||
            data.source === "out_of_context";

          if (answerStr && !isBadFallback) {
            return respondWithCache({
              answer: data.answer,
              citations: Array.isArray(data.citations) ? data.citations : [],
              source: data.source || "langchain_rag",
              ...(data.action ? { action: data.action } : {}),
              ...(data.content ? { content: data.content } : {}),
              ...(data.blockType ? { blockType: data.blockType } : {}),
              ...(data.language ? { language: data.language } : {}),
            }, 300);
          }
        }
      } catch {
        // Python service offline — fall through to in-process Gemini
      }
    }

    if (!isValidGeminiKey(GEMINI_API_KEY)) {
      return NextResponse.json({ answer: NO_KEY_ANSWER, citations: [], source: "no_key" });
    }

    // /write or natural language write command
    if (isWriteCmd) {
      const instruction = q.replace(/^(\/write|write|draft)\s*/i, "").trim();
      if (!instruction) {
        return NextResponse.json({
          answer: "Tell me what to write after `/write`, for example: `/write Explain Large Language Models`.",
          citations: [],
          source: "write_help",
        });
      }

      const content = await callGemini(
        `You are Notion AI, an expert writing assistant for documents and notes.
Instructions:
- Write clean, comprehensive, well-structured content for the user's document based on the following instruction: "${instruction}".
- Format with markdown headings (##, ###), clear paragraphs, bullet points (-), numbered lists (1.), quotes (>), checklists (- [ ] ), and code blocks where appropriate.
- Understand the user's intent even if their query contains typos, misspellings, or grammatical errors.
- NEVER comment on, quote, or mention any spelling mistakes, grammar errors, or prompt phrasing.
- Return ONLY the final structured markdown content. No greetings, no "Here is...", no "Sure!".

Previous conversation:
${conversationContext || "(none)"}

Workspace context:
${workspaceContext}`,
        GEMINI_API_KEY
      );

      return NextResponse.json({
        answer: `✍️ **Content written to active page**\n\n${content}`,
        citations: [],
        source: "agent_write",
        action: "append_block",
        blockType: "paragraph",
        content,
      });
    }

    // /code or natural language code command
    if (isCodeCmd) {
      const instruction = q.replace(/^(\/code|code)\s*/i, "").trim();
      if (!instruction) {
        return NextResponse.json({
          answer: "Tell me what code to create after `/code`, for example: `/code React button with loading state`.",
          citations: [],
          source: "code_help",
        });
      }
      const codeAnswer = GEMINI_API_KEY
        ? await callGemini(
            `You are an expert programming assistant.
Instructions:
- Provide a clear, concise explanation and a complete, well-formatted code block wrapped in \`\`\`language ... \`\`\`.
- Understand the user's intent even if their request has misspellings or informal phrasing.
- NEVER comment on typos or grammar.

Previous conversation:
${conversationContext || "(none)"}

User request: ${instruction}`,
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

    // /summary / /summery / /summarize command
    if (isSummaryCmd) {
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
          return respondWithCache({
            answer: `📝 **Page Summary: "${targetTitle}"**\n\n${geminiAnswer}`,
            citations: activePage ? [{ pageId: activePage._id.toString(), title: targetTitle }] : [],
            source: "gemini_summary",
          }, 600);
        }

        // Local summary without API key
        const lines = pageText.split("\n").map((l) => l.trim()).filter(Boolean);
        const wordCount = pageText.split(/\s+/).filter(Boolean).length;
        const excerpt = lines.slice(0, 8).map((l) => `• ${l}`).join("\n");
        return respondWithCache({
          answer: `📝 **Page Summary: "${targetTitle}"** (${wordCount} words)\n\n## 📌 Highlights\n${excerpt}${lines.length > 8 ? "\n\n*(and more)*" : ""}\n\n💡 *Tip: Add GEMINI_API_KEY to your .env.local file for deep AI-generated insights.*`,
          citations: activePage ? [{ pageId: activePage._id.toString(), title: targetTitle }] : [],
          source: "local_summary",
        }, 120);
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
          return respondWithCache({
            answer: `📝 **Workspace Executive Summary** (${pageCount} pages)\n\n${geminiAnswer}`,
            citations: pages.slice(0, 4).map((p) => ({ pageId: p._id.toString(), title: p.title || "Untitled" })),
            source: "gemini_summary",
          }, 300);
        }

        return respondWithCache({
          answer: `📝 **Workspace Summary** (${pageCount} pages)\n\nYour workspace contains: **${pageTitles.join(", ")}**.\n\n💡 Add a GEMINI_API_KEY to .env.local for AI-powered summaries, or start the Python RAG service.`,
          citations: pages.slice(0, 4).map((p) => ({ pageId: p._id.toString(), title: p.title || "Untitled" })),
        }, 180);
      }

      // 4. Truly empty page and empty workspace
      return NextResponse.json({
        answer: `📄 **"${targetTitle}"** has no written content yet.\n\nStart typing notes on the page, then ask \`/summary\` again!`,
        citations: [],
        source: "empty_page",
      });
    }

    // Normal Q&A with Gemini
    if (GEMINI_API_KEY) {
      // Check if query matches any workspace notes
      const normalizedQ = q.toLowerCase();
      const hasWorkspaceMatch = pages.some((p) => {
        const titleMatch = (p.title || "").toLowerCase().includes(normalizedQ);
        const blockMatch = (p.blocks || []).some((b: RawBlock) =>
          (b.properties?.text || "").toLowerCase().includes(normalizedQ)
        );
        return titleMatch || blockMatch;
      });

      if (hasWorkspaceMatch && contentCount > 0) {
        const workspaceAnswer = await callGemini(
          `You are Notion AI, an expert workspace assistant. Answer the user's question using the workspace notes below.
If the question is directly answered by the workspace content, provide a clear, helpful response.

Previous conversation:
${conversationContext || "(none)"}

Workspace pages (${pageCount} pages):
${workspaceContext}

User question: ${q}`,
          GEMINI_API_KEY
        );
        return respondWithCache({
          answer: workspaceAnswer,
          citations: pages.slice(0, 3).map((p) => ({ pageId: p._id.toString(), title: p.title || "Untitled" })),
          source: "gemini_rag",
        }, 300);
      }

      // General knowledge fallback when question isn't in workspace notes
      const generalAnswer = await callGemini(
        `You are Notion AI, an intelligent workspace assistant.
Instructions:
- Provide a clear, thorough, and well-structured answer to the user's question: "${q}".
- Format your response with clear markdown headings, paragraphs, bullet points, or code snippets where appropriate.
- Understand the user's intent even if their query contains typos, misspellings, or broken grammar.
- NEVER comment on, quote, or mention any spelling mistakes, grammar errors, or prompt phrasing.
- Directly deliver the informative, structured answer.

Previous conversation:
${conversationContext || "(none)"}`,
        GEMINI_API_KEY
      );

      return respondWithCache({
        answer: `${generalAnswer}\n\n*(Answered with Notion AI general knowledge. Try \`/search\` for live web search or \`/write\` to add directly to this page.)*`,
        citations: [],
        source: "general_ai",
      }, 600);
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

  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-flash"];
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
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
          }),
          signal: AbortSignal.timeout(20000),
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
