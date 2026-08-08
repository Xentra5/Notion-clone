import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { createStripeCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json();
    const priceId =
      plan === "ultimate"
        ? process.env.NEXT_PUBLIC_STRIPE_ULTIMATE_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID for plan '${plan}' is not configured.` },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const stripeSession = await createStripeCheckoutSession({
      userId: session.user.id || session.user.email,
      userEmail: session.user.email,
      priceId,
      successUrl: `${appUrl}/dashboard?payment=success`,
      cancelUrl: `${appUrl}/dashboard?payment=cancelled`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
