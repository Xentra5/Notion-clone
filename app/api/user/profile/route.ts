import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email }).select("name email plan createdAt").lean();
  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (body.newPassword) {
    if (!body.currentPassword || !(await bcryptjs.compare(body.currentPassword, user.password))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    if (String(body.newPassword).length < 8) return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    user.password = await bcryptjs.hash(String(body.newPassword), 12);
  }
  if (typeof body.name === "string") {
    const cleanName = body.name.trim().slice(0, 60);
    if (!cleanName) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    user.name = cleanName;
  }
  await user.save();
  return NextResponse.json({ user: { name: user.name, email: user.email, plan: user.plan, createdAt: user.createdAt } });
}