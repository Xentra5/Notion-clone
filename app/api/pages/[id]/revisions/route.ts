import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import Revision from "@/lib/models/revision";
import Page from "@/lib/models/page";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params;
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const revisions = await Revision.find({ pageId })
      .sort({ createdAt: -1 })
      .limit(30);

    return NextResponse.json({ revisions });
  } catch (error) {
    console.error("Fetch revisions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params;
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, revisionId } = await request.json();
    await connectToDatabase();

    if (action === "createSnapshot") {
      const page = await Page.findById(pageId);
      if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }

      const revision = await Revision.create({
        pageId,
        title: page.title,
        blocks: page.blocks,
        createdBy: session.user.email,
      });

      return NextResponse.json({ success: true, revision });
    }

    if (action === "restoreSnapshot" && revisionId) {
      const revision = await Revision.findById(revisionId);
      if (!revision) {
        return NextResponse.json({ error: "Revision not found" }, { status: 404 });
      }

      const updatedPage = await Page.findByIdAndUpdate(
        pageId,
        {
          title: revision.title,
          blocks: revision.blocks,
        },
        { returnDocument: "after" }
      );

      return NextResponse.json({ success: true, page: updatedPage });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Revision action error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
