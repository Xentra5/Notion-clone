import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/lib/models/page";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const pages = await Page.find({ userId: session.user.email, deletedAt: { $type: "date" } }).sort({ deletedAt: -1 }).lean();
  return NextResponse.json({ pages });
}