import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/lib/models/page";
import { serverCache } from "@/lib/cache";
import { ragQueue } from "@/lib/rag-queue";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(request);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await connectToDatabase();

  const page = await Page.findOne({ _id: id, userId: session.user.email });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  // 1. Verify parent status: if parent was trashed or doesn't exist, promote to root
  //    to prevent orphaned, unreachable nodes in the sidebar tree.
  let newParentPageId = page.parentPageId;
  let newAncestors = page.ancestors || [];
  if (page.parentPageId) {
    const parent = await Page.findOne({ _id: page.parentPageId, userId: session.user.email }).lean();
    if (!parent || parent.deletedAt) {
      newParentPageId = null;
      newAncestors = [];
    }
  }

  // 2. Restore this page
  page.deletedAt = null;
  page.parentPageId = newParentPageId;
  page.ancestors = newAncestors;
  await page.save();

  // 3. Cascade restore any descendant pages that were trashed with this parent
  const descendantPages = await Page.find({
    ancestors: id,
    userId: session.user.email,
    deletedAt: { $ne: null },
  });

  if (descendantPages.length > 0) {
    await Page.updateMany(
      { _id: { $in: descendantPages.map((d) => d._id) }, userId: session.user.email },
      { $set: { deletedAt: null } }
    );
  }

  const allRestoredPages = [page, ...descendantPages];

  // 4. Re-index all restored pages into the RAG vector store
  for (const p of allRestoredPages) {
    ragQueue.enqueueIndex({
      workspaceId: session.user.email,
      pageId: p._id.toString(),
      title: p.title || "Untitled",
      blocks: (p.blocks || []).map((b: { id: string; type: string; properties?: { text?: string } }) => ({
        id: b.id,
        type: b.type,
        text: b.properties?.text || "",
      })),
    });
  }

  // 5. Invalidate cached documents, lists, and AI responses
  for (const p of allRestoredPages) {
    serverCache.invalidate(`page:doc:${p._id.toString()}:${session.user.email}`);
  }
  serverCache.invalidate(`pages:list:${session.user.email}`);
  serverCache.invalidate(`pages:trash:${session.user.email}`);
  serverCache.invalidatePrefix(`pages:workspace:${session.user.email}`);
  serverCache.invalidatePrefix(`ai:res:${session.user.email}`);

  return NextResponse.json({ page, restoredCount: allRestoredPages.length });
}