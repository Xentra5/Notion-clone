import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { collaborationHub } from "@/lib/collaboration/hub";

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pageId } = await params;
    if (!pageId) {
      return NextResponse.json({ error: "Page ID required" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, x, y, blockId, title, connectionId } = body;

    if (action === "cursor") {
      collaborationHub.updatePresence(pageId, connectionId || session.user.email, {
        x: typeof x === "number" ? x : undefined,
        y: typeof y === "number" ? y : undefined,
        blockId: typeof blockId === "string" ? blockId : undefined,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "page-updated") {
      collaborationHub.notifyPageUpdated(pageId, session.user.email, title);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Collaboration event error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
