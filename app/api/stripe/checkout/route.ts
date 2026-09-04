import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { createStripeCheckoutSession } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit — prevent checkout session flooding
    const rl = await checkRateLimit(request, "stripe_checkout", { limit: 10, windowMs: 60_000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { plan } = await request.json();
    // SECURITY: Stripe price IDs are kept server-side only (no NEXT_PUBLIC_ prefix).
    // Using NEXT_PUBLIC_ would bundle them into client JS — while not catastrophic,
    // it reveals your pricing structure and can aid crafted checkout bypasses.
    const priceId =
      plan === "ultimate"
        ? process.env.STRIPE_ULTIMATE_PRICE_ID
        : process.env.STRIPE_PRO_PRICE_ID;

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
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Stripe Checkout error:", error);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
