import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/lib/models/page";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/pages/[id] — fetch a single page by its MongoDB _id
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const page = await Page.findOne({
      _id: id,
      userId: session.user.email,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    }).lean();

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

// PATCH /api/pages/[id] — update title, blocks, category, or icon
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, blocks, category, icon } = body;

    // Build update payload from only the provided fields
    const $set: Record<string, unknown> = {};
    if (title !== undefined) $set.title = title;
    if (blocks !== undefined) $set.blocks = blocks;
    if (category !== undefined) $set.category = category;
    if (icon !== undefined) $set.icon = icon;

    if (Object.keys($set).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await connectToDatabase();

    const page = await Page.findOneAndUpdate(
      { _id: id, userId: session.user.email, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
      { $set },
      { new: true, lean: true }
    );

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

// DELETE /api/pages/[id] — move a page to Trash, or permanently delete it when requested.
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const isPermanent = new URL(req.url).searchParams.get("permanent") === "true";
    await connectToDatabase();

    const result = isPermanent
      ? await Page.findOneAndDelete({ _id: id, userId: session.user.email })
      : await Page.findOneAndUpdate(
          { _id: id, userId: session.user.email, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
          { $set: { deletedAt: new Date() } },
          { new: true }
        );

    if (!result) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    return NextResponse.json({ success: true, permanent: isPermanent });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}