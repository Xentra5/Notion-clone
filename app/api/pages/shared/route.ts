/**
 * app/api/pages/shared/route.ts
 *
 * GET /api/pages/shared
 * Returns all pages that have been shared with the currently logged-in user
 * (where their invite status is "accepted").
 *
 * The sidebar "Shared" section calls this endpoint to render real data
 * instead of the hardcoded "Q3 Product Roadmap" placeholder.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import Collaboration from "@/lib/models/collaboration";
import Page from "@/lib/models/page";
import { serverCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase();
    const cacheKey = `pages:shared:${userEmail}`;

    const cached = serverCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ pages: cached });
    }

    await connectToDatabase();

    // 1. Find all accepted invites for this user
    const acceptedCollabs = await Collaboration.find({
      invitedEmail: userEmail,
      status: "accepted",
    })
      .select("pageId role inviterEmail inviterName")
      .lean() as {
        pageId: string;
        role: string;
        inviterEmail: string;
        inviterName: string;
      }[];

    if (acceptedCollabs.length === 0) {
      return NextResponse.json({ pages: [] });
    }

    // 2. Resolve the actual page documents (only non-deleted)
    const pageIds = acceptedCollabs.map((c) => c.pageId);
    const pages = await Page.find({
      _id: { $in: pageIds },
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    })
      .select(
        "_id title icon coverImage category parentPageId updatedAt createdAt"
      )
      .lean() as {
        _id: { toString(): string };
        title: string;
        icon: string;
        category: string;
        updatedAt: Date;
        [key: string]: unknown;
      }[];

    // 3. Enrich each page with collaboration metadata
    const collabMap = new Map(
      acceptedCollabs.map((c) => [c.pageId, c])
    );

    const enriched = pages.map((p) => {
      const collab = collabMap.get(p._id.toString());
      return {
        ...p,
        _id: p._id.toString(),
        sharedBy: collab?.inviterName || collab?.inviterEmail || "",
        sharedByEmail: collab?.inviterEmail || "",
        myRole: collab?.role || "view",
      };
    });

    serverCache.set(cacheKey, enriched, 60); // 60s TTL

    return NextResponse.json({ pages: enriched });
  } catch (error) {
    console.error("Error fetching shared pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared pages" },
      { status: 500 }
    );
  }
}
