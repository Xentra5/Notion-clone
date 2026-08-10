import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, paymentId, signature, plan } = await request.json();
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "RAZORPAY_KEY_SECRET is missing" },
        { status: 500 }
      );
    }

    const isValid = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
      secret,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature verification" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await User.findOneAndUpdate(
      { email: session.user.email.toLowerCase() },
      {
        plan: plan || "pro",
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
      }
    );

    return NextResponse.json({ success: true, plan: plan || "pro" });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Razorpay Verification Error:", error);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
