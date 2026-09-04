import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { createRazorpayOrder } from "@/lib/razorpay";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit — prevent payment endpoint flooding
    const rl = await checkRateLimit(request, "razorpay_order", { limit: 10, windowMs: 60_000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { plan } = await request.json();

    // SECURITY: Only accept known plan values — never trust arbitrary strings from the client
    const VALID_PLANS = ["pro", "ultimate"] as const;
    const safePlan = VALID_PLANS.includes(plan) ? plan : "pro";

    // Prices in paise (₹499 = 49900, ₹999 = 99900)
    const amount = safePlan === "ultimate" ? 99900 : 49900;

    const order = await createRazorpayOrder({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userEmail: session.user.email,
        // Store the authoritative plan in Razorpay order notes.
        // The verify endpoint reads it from here, NOT from the client body.
        plan: safePlan,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Razorpay Order Error:", error);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
