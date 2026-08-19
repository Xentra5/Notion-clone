import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import Page, { removeLegacyTitleIndex } from "@/lib/models/page";

// GET /api/pages — fetch all pages for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const pages = await Page.find({ userId: session.user.email, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

// POST /api/pages — create a new page (creation only — use PATCH /api/pages/[id] to update)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { title, category, parentPageId, isAiMeetingNote, blocks } = body as {
      title?: unknown;
      category?: unknown;
      parentPageId?: unknown;
      isAiMeetingNote?: unknown;
      blocks?: unknown;
    };
    const pageTitle = typeof title === "string" && title.trim() ? title.trim() : "Untitled";
    const pageCategory = category === "Private" || category === "Shared" || category === "Meetings" ? category : "Private";
    const parentId = typeof parentPageId === "string" && parentPageId.trim() ? parentPageId.trim() : null;

    if (blocks !== undefined && !Array.isArray(blocks)) {
      return NextResponse.json({ error: "Blocks must be an array" }, { status: 400 });
    }

    const pageBlocks = (blocks ?? []).map((block, index) => {
      if (!block || typeof block !== "object" || Array.isArray(block)) {
        throw new Error("Invalid block at index " + index);
      }
      const candidate = block as Record<string, unknown>;
      const properties = candidate.properties;
      if (!properties || typeof properties !== "object" || Array.isArray(properties)) {
        throw new Error("Invalid block properties at index " + index);
      }
      return {
        id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : crypto.randomUUID(),
        type: typeof candidate.type === "string" && candidate.type.trim() ? candidate.type : "paragraph",
        properties,
        ...(Array.isArray(candidate.content) ? { content: candidate.content.filter((item): item is string => typeof item === "string") } : {}),
        ...(typeof candidate.parent === "string" ? { parent: candidate.parent } : {}),
      };
    });

    await connectToDatabase();
    await removeLegacyTitleIndex();

    const page = await Page.create({
      userId: session.user.email,
      title: pageTitle,
      icon: "📄",
      category: pageCategory,
      parentPageId: parentId,
      isAiMeetingNote: !!isAiMeetingNote,
      blocks: pageBlocks,
    });

    // Background sync to RAG microservice
    const ragServiceUrl = process.env.RAG_SERVICE_URL || "http://localhost:8000";
    void fetch(`${ragServiceUrl}/index-page`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: session.user.email,
        pageId: page._id.toString(),
        title: page.title,
        blocks: pageBlocks.map((b: { id: string; type: string; properties?: { text?: string } }) => ({
          id: b.id,
          type: b.type,
          text: b.properties?.text || "",
        })),
      }),
      signal: AbortSignal.timeout(3000),
    }).catch(() => null);

    return NextResponse.json({ page: page.toObject() }, { status: 201 });
  } catch (error) {
    const err = error as Error & { code?: number; errors?: Record<string, unknown> };
    console.error("Error creating page:", err.message, err.errors ?? "");
    const detail = process.env.NODE_ENV !== "production" ? err.message : "Database operation failed. Check the server logs.";
    const status = err.name === "ValidationError" ? 400 : 500;
    return NextResponse.json({ error: "Failed to create page", detail }, { status });
  }
}
