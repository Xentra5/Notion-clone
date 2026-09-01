import { NextRequest } from "next/server";
import { getSession } from "@/lib/server-session";
import { collaborationHub } from "@/lib/collaboration/hub";

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

// Consistent color palette for collaborator avatars and cursors
const COLLAB_COLORS = [
  "#2383e2", // Notion Blue
  "#0f7b6c", // Emerald Green
  "#d9730d", // Warm Orange
  "#d44040", // Coral Red
  "#8a3fe2", // Vibrant Purple
  "#19a797", // Teal
  "#e03e65", // Pink
  "#2eaadc", // Sky
];

function getCollaboratorColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLLAB_COLORS[Math.abs(hash) % COLLAB_COLORS.length];
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSession(request);
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { pageId } = await params;
  if (!pageId) {
    return new Response("Page ID required", { status: 400 });
  }

  const connectionId = `${session.user.email}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const userName = session.user.name || session.user.email.split("@")[0] || "Anonymous";
  const userColor = getCollaboratorColor(session.user.email);

  let keepAliveTimer: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // 1. Register with collaboration hub
      collaborationHub.addSubscriber(
        pageId,
        connectionId,
        {
          id: session.user.id || session.user.email,
          name: userName,
          email: session.user.email,
          color: userColor,
        },
        controller
      );

      // 2. Periodic keep-alive ping (every 15 seconds) to prevent timeouts
      keepAliveTimer = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": ping\n\n"));
        } catch {
          if (keepAliveTimer) clearInterval(keepAliveTimer);
        }
      }, 15000);

      // 3. Clean up when client disconnects
      request.signal.addEventListener("abort", () => {
        if (keepAliveTimer) clearInterval(keepAliveTimer);
        collaborationHub.removeSubscriber(pageId, connectionId);
        try {
          controller.close();
        } catch {
          // ignore already closed
        }
      });
    },
    cancel() {
      if (keepAliveTimer) clearInterval(keepAliveTimer);
      collaborationHub.removeSubscriber(pageId, connectionId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform, max-age=0",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
