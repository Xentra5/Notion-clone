import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_API_KEY || "dummy_key_for_build", {
  apiVersion: "2025-02-24.acacia" as any,
  typescript: true,
});

export async function createStripeCheckoutSession({
  userId,
  userEmail,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  if (!process.env.STRIPE_API_KEY) {
    throw new Error("STRIPE_API_KEY is not configured.");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    billing_address_collection: "auto",
    customer_email: userEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  });

  return session;
}
