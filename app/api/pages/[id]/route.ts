import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/lib/models/page";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/pages/[id] — fetch a single page by its MongoDB _id
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

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
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, blocks, category, icon, coverImage, parentPageId } = body;

    // Build update payload from only the provided fields
    const $set: Record<string, unknown> = {};
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ error: "Page title cannot be empty" }, { status: 400 });
      }
      $set.title = title.trim();
    }
    if (blocks !== undefined) $set.blocks = blocks;
    if (category !== undefined) $set.category = category;
    if (icon !== undefined) $set.icon = icon;
    if (coverImage !== undefined) $set.coverImage = coverImage;
    if (parentPageId !== undefined) {
      if (parentPageId === id) {
        return NextResponse.json({ error: "A page cannot be its own parent" }, { status: 400 });
      }
      $set.parentPageId = parentPageId || null;
    }

    if (Object.keys($set).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await connectToDatabase();

    // Circular Reference Validation
    if ($set.parentPageId && typeof $set.parentPageId === "string") {
      let currentCheck: string | null = $set.parentPageId;
      while (currentCheck) {
        if (currentCheck === id) {
          return NextResponse.json({ error: "Circular parent reference detected" }, { status: 400 });
        }
        const parentDoc: { parentPageId?: string | null } | null = await Page.findById(currentCheck).select("parentPageId").lean();
        currentCheck = parentDoc?.parentPageId || null;
      }
    }

    const page = await Page.findOneAndUpdate(
      { _id: id, userId: session.user.email, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
      { $set },
      { new: true, lean: true, runValidators: true }
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

async function getDescendantPageIds(parentId: string, userId: string): Promise<string[]> {
  const children = await Page.find({ parentPageId: parentId, userId }).select("_id").lean();
  let ids: string[] = children.map((c) => (c._id as mongoose.Types.ObjectId).toString());
  for (const childId of ids) {
    const subChildren = await getDescendantPageIds(childId, userId);
    ids = ids.concat(subChildren);
  }
  return ids;
}

// DELETE /api/pages/[id] — move a page and all its sub-tree child pages to Trash, or permanently delete them.
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const isPermanent = new URL(request.url).searchParams.get("permanent") === "true";
    await connectToDatabase();

    const descendantIds = await getDescendantPageIds(id, session.user.email);
    const targetIds = [id, ...descendantIds];

    if (isPermanent) {
      const result = await Page.deleteMany({ _id: { $in: targetIds }, userId: session.user.email });
      if (result.deletedCount === 0) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    } else {
      const now = new Date();
      const result = await Page.updateMany(
        { _id: { $in: targetIds }, userId: session.user.email },
        { $set: { deletedAt: now } }
      );
      if (result.matchedCount === 0) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, permanent: isPermanent, deletedCount: targetIds.length });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}