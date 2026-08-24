import Stripe from "stripe";
import { env, isMock } from "@/lib/env";
import { db } from "@/lib/db";

let stripeClient: Stripe | null = null;
export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export async function startCheckout(params: {
  organizationId: string;
  planId: string;
  planKey: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  if (isMock.billing) {
    // Dev-only: flips the plan immediately, never touches real money. Real Stripe Checkout takes over once STRIPE_SECRET_KEY is set.
    const plan = await db.plan.findUniqueOrThrow({ where: { id: params.planId } });
    await db.subscription.upsert({
      where: { organizationId: params.organizationId },
      create: {
        organizationId: params.organizationId,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: { planId: plan.id, status: "ACTIVE" },
    });
    return { url: `${params.successUrl}?dev_mode=true&plan=${params.planKey}` };
  }

  const plan = await db.plan.findUniqueOrThrow({ where: { id: params.planId } });
  if (!plan.stripePriceId) {
    throw new Error(`Plan ${plan.key} has no stripePriceId configured — set one from Super Admin before selling it live.`);
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.organizationId,
  });

  return { url: session.url ?? params.cancelUrl };
}
