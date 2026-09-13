/**
 * app/api/invite/accept/route.ts
 *
 * GET /api/invite/accept?token=<token>
 *
 * Validates the invite token, marks the collaboration as "accepted",
 * creates a notification for the page owner, then redirects the user
 * to the shared page in the dashboard.
 *
 * Called by the link in the invite email.
 */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Collaboration from "@/lib/models/collaboration";
import Notification from "@/lib/models/notification";
import { serverCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const baseUrl =
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(
      `${baseUrl}/invite/accept?error=missing_token`
    );
  }

  try {
    await connectToDatabase();

    const collaboration = await Collaboration.findOne({ token }).lean() as {
      _id: string;
      pageId: string;
      pageTitle: string;
      inviterEmail: string;
      inviterName: string;
      invitedEmail: string;
      role: string;
      status: string;
    } | null;

    if (!collaboration) {
      return NextResponse.redirect(
        `${baseUrl}/invite/accept?error=invalid_token`
      );
    }

    if (collaboration.status === "accepted") {
      // Already accepted — just send them to the page
      return NextResponse.redirect(
        `${baseUrl}/dashboard/${collaboration.pageId}?invited=already_accepted`
      );
    }

    // Mark as accepted and clear the token so it can't be replayed
    await Collaboration.findByIdAndUpdate(collaboration._id, {
      $set: { status: "accepted", acceptedAt: new Date(), token: null },
    });

    // Invalidate the shared-pages cache for the invitee
    serverCache.invalidate(`pages:shared:${collaboration.invitedEmail}`);

    // Notify the page owner that their invite was accepted
    await Notification.create({
      recipientEmail: collaboration.inviterEmail,
      actorName: collaboration.invitedEmail,
      actorEmail: collaboration.invitedEmail,
      type: "invite_accepted",
      title: "Invitation accepted",
      message: `${collaboration.invitedEmail} accepted your invite to "${collaboration.pageTitle}"`,
      pageId: collaboration.pageId,
      pageTitle: collaboration.pageTitle,
    });

    // Redirect to the page (the app will show a toast via the query param)
    return NextResponse.redirect(
      `${baseUrl}/dashboard/${collaboration.pageId}?invited=accepted&page=${encodeURIComponent(collaboration.pageTitle)}`
    );
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.redirect(
      `${baseUrl}/invite/accept?error=server_error`
    );
  }
}
