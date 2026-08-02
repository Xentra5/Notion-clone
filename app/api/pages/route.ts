import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/lib/models/page";

// GET /api/pages — fetch all pages for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const pages = await Page.find({ userId: session.user.email })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

// POST /api/pages — create a new page OR upsert an existing one by title
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, category, isAiMeetingNote, blocks } = await request.json();
    const pageTitle = (title || "Untitled").trim();

    if (!pageTitle) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Upsert: update if page with same title exists for user, else create
    const page = await Page.findOneAndUpdate(
      { userId: session.user.email, title: pageTitle },
      {
        $set: {
          category: category || "Private",
          isAiMeetingNote: !!isAiMeetingNote,
          blocks: blocks || [
            {
              id: "block-1",
              type: "paragraph",
              properties: { text: "Start writing here..." },
            },
          ],
        },
        $setOnInsert: {
          userId: session.user.email,
          title: pageTitle,
          icon: "📄",
        },
      },
      { upsert: true, new: true, lean: true }
    );

    return NextResponse.json({ page }, { status: 200 });
  } catch (error) {
    console.error("Error saving page:", error);
    return NextResponse.json({ error: "Failed to save page" }, { status: 500 });
  }
}
