import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/user";

interface StripeSession {
  customer_email?: string;
  metadata?: Record<string, string>;
  customer?: string;
  subscription?: string;
}

interface StripeSubscription {
  id: string;
}

interface StripeEvent {
  type: string;
  data: { object: Record<string, unknown> };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !signature) {
    return NextResponse.json(
      { error: "Webhook secret or signature missing" },
      { status: 400 }
    );
  }

  let event: StripeEvent;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret) as unknown as StripeEvent;
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Stripe Webhook Signature Error:", error?.message);
    return NextResponse.json({ error: `Webhook Error: ${error?.message}` }, { status: 400 });
  }

  await connectToDatabase();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as StripeSession;
      const userEmail = session.customer_email || session.metadata?.userEmail;
      if (userEmail) {
        await User.findOneAndUpdate(
          { email: userEmail.toLowerCase() },
          {
            plan: session.metadata?.plan || "pro",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          }
        );
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as unknown as StripeSubscription;
      await User.findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        {
          plan: "free",
          stripeSubscriptionId: null,
          stripePriceId: null,
        }
      );
      break;
    }
  }

  return NextResponse.json({ received: true });
}
