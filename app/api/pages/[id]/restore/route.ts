import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/lib/models/page";
import { serverCache } from "@/lib/cache";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(request);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await connectToDatabase();
  const page = await Page.findOneAndUpdate(
    { _id: id, userId: session.user.email },
    { $set: { deletedAt: null } },
    { returnDocument: "after" }
  ).lean();
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  // Invalidate cached workspace pages and AI responses
  serverCache.invalidatePrefix(`pages:workspace:${session.user.email}`);
  serverCache.invalidatePrefix(`ai:res:${session.user.email}`);

  return NextResponse.json({ page });
}