import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/user";
import { checkRateLimit } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email.toLowerCase() })
      .select("plan aiUsageCount")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = user.plan || "free";
    const aiUsageCount = typeof user.aiUsageCount === "number" ? user.aiUsageCount : 0;
    const remainingFree = Math.max(0, 3 - aiUsageCount);
    const isLimitReached = plan === "free" && aiUsageCount >= 3;

    return NextResponse.json({
      plan,
      aiUsageCount,
      remainingFree,
      isLimitReached,
    });
  } catch (error) {
    console.error("Plan GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(request, "plan_api", { limit: 20, windowMs: 60000 });
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, plan } = await request.json();
    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "upgrade") {
      user.plan = plan || "pro";
      await user.save();
      return NextResponse.json({ success: true, plan: user.plan });
    }

    if (action === "resetFreeUsage") {
      user.aiUsageCount = 0;
      await user.save();
      return NextResponse.json({ success: true, aiUsageCount: 0, plan: user.plan });
    }

    if (action === "incrementAiUsage") {
      // Check if user is free and already hit the limit (3 messages)
      if (user.plan === "free" && (user.aiUsageCount || 0) >= 3) {
        return NextResponse.json({ 
          error: "Free trial limit reached", 
          limitReached: true,
          plan: user.plan,
          aiUsageCount: user.aiUsageCount 
        }, { status: 403 });
      }

      user.aiUsageCount = (user.aiUsageCount || 0) + 1;
      await user.save();
      return NextResponse.json({ success: true, aiUsageCount: user.aiUsageCount, plan: user.plan });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Plan API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
