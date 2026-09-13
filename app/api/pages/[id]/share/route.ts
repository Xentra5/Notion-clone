/**
 * app/api/pages/[id]/share/route.ts
 *
 * GET    /api/pages/:id/share  — list collaborators for a page
 * POST   /api/pages/:id/share  — invite a collaborator by email
 * DELETE /api/pages/:id/share  — remove a collaborator
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/lib/models/page";
import Collaboration from "@/lib/models/collaboration";
import Notification from "@/lib/models/notification";
import { sendInviteEmail } from "@/lib/email";
import { serverCache } from "@/lib/cache";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/pages/:id/share — list all collaborators for this page
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: pageId } = await params;
    await connectToDatabase();

    // Verify the requester owns (or has access to) this page
    const page = await Page.findOne({
      _id: pageId,
      userId: session.user.email,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    })
      .select("_id title")
      .lean();

    if (!page) {
      // Also allow collaborators to see the list
      const collab = await Collaboration.findOne({
        pageId,
        invitedEmail: session.user.email,
        status: "accepted",
      }).lean();
      if (!collab) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }
    }

    const collaborators = await Collaboration.find({ pageId })
      .select("invitedEmail inviterEmail role status acceptedAt createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ collaborators });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborators" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/pages/:id/share — invite someone
// Body: { email: string, role: "full"|"edit"|"comment"|"view" }
// Also handles: { isPublic: boolean } to toggle public share link
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: pageId } = await params;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { email, role, isPublic } = body as {
      email?: string;
      role?: string;
      isPublic?: boolean;
    };

    await connectToDatabase();

    // Verify ownership
    const page = await Page.findOne({
      _id: pageId,
      userId: session.user.email,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    })
      .select("_id title permission")
      .lean() as { _id: string; title: string; permission: string } | null;

    if (!page) {
      return NextResponse.json({ error: "Page not found or access denied" }, { status: 404 });
    }

    // ── Toggle public link ──────────────────────────────────────────────────
    if (typeof isPublic === "boolean") {
      const newPermission = isPublic ? "Public" : "Private";
      await Page.findByIdAndUpdate(pageId, { $set: { permission: newPermission } });
      serverCache.invalidate(`page:doc:${pageId}:${session.user.email}`);
      return NextResponse.json({ success: true, permission: newPermission });
    }

    // ── Invite by email ─────────────────────────────────────────────────────
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const validRoles = ["full", "edit", "comment", "view"];
    const inviteRole = validRoles.includes(role ?? "") ? role! : "edit";

    if (normalizedEmail === session.user.email.toLowerCase()) {
      return NextResponse.json({ error: "You cannot invite yourself" }, { status: 400 });
    }

    // Generate a URL-safe random invite token
    const token = Buffer.from(crypto.randomUUID()).toString("base64url");

    // Upsert — if they were already invited, update role and re-send
    const collaboration = await Collaboration.findOneAndUpdate(
      { pageId, invitedEmail: normalizedEmail },
      {
        $set: {
          pageTitle: page.title,
          inviterEmail: session.user.email,
          inviterName: session.user.name || session.user.email,
          role: inviteRole,
          status: "pending",
          token,
          acceptedAt: null,
        },
      },
      { upsert: true, new: true }
    );

    // Build the accept URL
    const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const inviteUrl = `${baseUrl}/invite/accept?token=${token}`;

    // Send the invite email (dev: logs to console)
    await sendInviteEmail({
      to: normalizedEmail,
      inviterName: session.user.name || session.user.email,
      pageTitle: page.title,
      inviteUrl,
      role: inviteRole as "full" | "edit" | "comment" | "view",
    });

    // Persist a notification for the invitee (they'll see it when they log in)
    await Notification.create({
      recipientEmail: normalizedEmail,
      actorName: session.user.name || session.user.email,
      actorEmail: session.user.email,
      type: "page_shared",
      title: "You've been invited to collaborate",
      message: `${session.user.name || session.user.email} invited you to "${page.title}" with ${inviteRole} access`,
      pageId,
      pageTitle: page.title,
    });

    return NextResponse.json(
      { success: true, collaboration },
      { status: 201 }
    );
  } catch (error) {
    const err = error as Error & { code?: number };
    console.error("Error inviting collaborator:", err);
    // Duplicate key = already invited; treat as success
    if (err.code === 11000) {
      return NextResponse.json({ success: true, alreadyInvited: true });
    }
    return NextResponse.json(
      { error: "Failed to invite collaborator" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/pages/:id/share — remove a collaborator
// Body: { email: string }
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: pageId } = await params;
    const body = await request.json().catch(() => null);
    const email =
      typeof body?.email === "string" ? body.email.toLowerCase().trim() : null;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await connectToDatabase();

    // Verify ownership
    const page = await Page.findOne({
      _id: pageId,
      userId: session.user.email,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    })
      .select("_id")
      .lean();

    if (!page) {
      return NextResponse.json({ error: "Page not found or access denied" }, { status: 404 });
    }

    const result = await Collaboration.deleteOne({ pageId, invitedEmail: email });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Collaborator not found" }, { status: 404 });
    }

    // Invalidate shared pages cache for the removed collaborator
    serverCache.invalidate(`pages:shared:${email}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json(
      { error: "Failed to remove collaborator" },
      { status: 500 }
    );
  }
}
