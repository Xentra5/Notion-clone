import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/lib/models/page";
import { serverCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cacheKey = `pages:trash:${session.user.email}`;
  const cached = serverCache.get(cacheKey);
  if (cached) return NextResponse.json({ pages: cached });

  await connectToDatabase();
  const pages = await Page.find({ userId: session.user.email, deletedAt: { $type: "date" } }).sort({ deletedAt: -1 }).lean();
  serverCache.set(cacheKey, pages, 60); // 60s TTL

  return NextResponse.json({ pages });
}