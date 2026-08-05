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
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, category, isAiMeetingNote, blocks } = await request.json();
    const pageTitle = (title || "Untitled").trim();

    await connectToDatabase();

    const page = await Page.create({
      userId: session.user.email,
      title: pageTitle,
      icon: "📄",
      category: category || "Private",
      isAiMeetingNote: !!isAiMeetingNote,
      blocks: blocks || [],
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}

