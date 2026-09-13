/**
 * app/api/notifications/route.ts
 *
 * GET  /api/notifications          — fetch the user's notification feed from MongoDB
 * POST /api/notifications          — mark as read (body: { id } or { all: true })
 * PATCH /api/notifications         — legacy compat (kept for existing callers)
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/lib/models/notification";

// ─────────────────────────────────────────────────────────────────────────────
// GET — fetch notifications for the current user
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase();
    await connectToDatabase();

    const notifications = await Notification.find({
      recipientEmail: userEmail,
    })
      .select(
        "_id actorName actorEmail actorAvatar type title message pageId pageTitle isRead createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Reshape _id to id for client compatibility
    const shaped = notifications.map((n) => ({
      ...n,
      id: (n._id as { toString(): string }).toString(),
      recipientId: userEmail,
    }));

    const unreadCount = shaped.filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications: shaped, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — mark notification(s) as read
// Body: { id: string } | { all: true }
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase();
    const body = await request.json().catch(() => ({})) as {
      id?: string;
      all?: boolean;
      action?: string;
    };

    await connectToDatabase();

    if (body.all === true || body.action === "readAll") {
      await Notification.updateMany(
        { recipientEmail: userEmail, isRead: false },
        { $set: { isRead: true } }
      );
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      await Notification.findOneAndUpdate(
        { _id: body.id, recipientEmail: userEmail },
        { $set: { isRead: true } }
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Provide id or all=true" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error marking notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH — legacy compat kept for existing callers
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  return POST(request);
}
