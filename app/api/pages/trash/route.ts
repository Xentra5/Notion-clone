import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/lib/models/page";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const pages = await Page.find({ userId: session.user.email, deletedAt: { $type: "date" } }).sort({ deletedAt: -1 }).lean();
  return NextResponse.json({ pages });
}