import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/server-session";
import AiChat from "@/lib/models/ai-chat";
import { serverCache } from "@/lib/cache";

const pageKey = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : "workspace";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pageId = pageKey(new URL(request.url).searchParams.get("pageId"));
  const cacheKey = `ai:chat:${session.user.email}:${pageId}`;

  // 1. Check in-memory cache
  const cachedMessages = serverCache.get(cacheKey);
  if (cachedMessages) {
    return NextResponse.json({ messages: cachedMessages });
  }

  // 2. Fetch from MongoDB
  await connectToDatabase();
  const chat = await AiChat.findOne({ userId: session.user.email, pageId }).lean();
  const messages = chat?.messages || [];

  // 3. Cache for 3 minutes (180 seconds)
  serverCache.set(cacheKey, messages, 180);

  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!Array.isArray(body.messages)) return NextResponse.json({ error: "messages is required" }, { status: 400 });
  const messages = body.messages.filter((m: { role?: string; text?: unknown }) =>
    (m.role === "user" || m.role === "assistant") && typeof m.text === "string"
  ).slice(-50).map((m: { id?: string; role: "user" | "assistant"; text: string; citations?: unknown[]; source?: string }) => ({
    id: m.id || `${Date.now()}-${Math.random()}`, role: m.role, text: m.text.slice(0, 12000),
    citations: Array.isArray(m.citations) ? m.citations.slice(0, 8) : [], source: m.source || "",
  }));

  const targetPageId = pageKey(body.pageId);
  const cacheKey = `ai:chat:${session.user.email}:${targetPageId}`;

  // Write-through cache: immediately update cache
  serverCache.set(cacheKey, messages, 180);

  await connectToDatabase();
  await AiChat.findOneAndUpdate(
    { userId: session.user.email, pageId: targetPageId },
    { $set: { messages } }, { upsert: true, returnDocument: "after" }
  );
  return NextResponse.json({ ok: true, messages });
}

