import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json();

    // Set prices (in paise: ₹499 = 49900 paise, ₹999 = 99900 paise)
    const amount = plan === "ultimate" ? 99900 : 49900;

    const order = await createRazorpayOrder({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userEmail: session.user.email,
        plan: plan || "pro",
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
