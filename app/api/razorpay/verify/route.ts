import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/user";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limit — prevent replay-loop attacks
    const rl = await checkRateLimit(request, "razorpay_verify", { limit: 10, windowMs: 60_000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { orderId, paymentId, signature } = await request.json();
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "RAZORPAY_KEY_SECRET is missing" },
        { status: 500 }
      );
    }

    // 3. Validate inputs
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "orderId, paymentId and signature are required" }, { status: 400 });
    }

    // 4. Verify HMAC signature — this proves Razorpay generated this payment
    const isValid = verifyRazorpaySignature({ orderId, paymentId, signature, secret });
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 5. Idempotency check — reject replayed paymentIds
    //    SECURITY: A valid (orderId, paymentId, signature) tuple can be replayed
    //    without this check. We store the paymentId on the user and reject duplicates.
    const existingUser = await User.findOne({ razorpayPaymentId: paymentId });
    if (existingUser) {
      // Already processed — return success but do nothing (idempotent)
      return NextResponse.json({ success: true, plan: existingUser.plan, alreadyProcessed: true });
    }

    // 6. Look up the Razorpay order to get the authoritative plan
    //    SECURITY: We do NOT trust the `plan` field from the client request body.
    //    An attacker could pay for "pro" but send plan="ultimate" in the request.
    //    Instead, we fetch the order from Razorpay and read the plan from order.notes.
    let plan = "pro"; // safe default
    try {
      const keyId = process.env.RAZORPAY_KEY_ID;
      if (keyId && secret) {
        const authHeader = Buffer.from(`${keyId}:${secret}`).toString("base64");
        const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
          headers: { Authorization: `Basic ${authHeader}` },
          signal: AbortSignal.timeout(8000),
        });
        if (orderRes.ok) {
          const orderData = await orderRes.json() as { notes?: { plan?: string } };
          const notePlan = orderData?.notes?.plan;
          // Only accept known plan values from the order notes
          if (notePlan === "pro" || notePlan === "ultimate") {
            plan = notePlan;
          }
        }
      }
    } catch (orderErr) {
      console.error("[Razorpay verify] Could not fetch order details:", orderErr);
      // Continue with default plan — do not block the user from getting their purchase
    }

    // 7. Upgrade the user in DB
    await User.findOneAndUpdate(
      { email: session.user.email.toLowerCase() },
      {
        plan,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
      }
    );

    return NextResponse.json({ success: true, plan });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Razorpay Verification Error:", error);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
