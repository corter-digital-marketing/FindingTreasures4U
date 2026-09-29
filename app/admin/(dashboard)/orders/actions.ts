"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendShippingQuoteEmail } from "@/lib/email";
import type { OrderStatus } from "@/app/generated/prisma";
import { safeRevalidatePath } from "@/lib/revalidate";

const VALID_STATUSES: OrderStatus[] = ["PAID", "FULFILLED", "CANCELLED"];

export async function updateOrderStatus(orderId: string, status: string) {
  if (!VALID_STATUSES.includes(status as OrderStatus)) return;
  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });
  safeRevalidatePath("/", "layout");
}

async function getSiteOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    return process.env.SITE_URL ?? "http://localhost:3000";
  }
}

/**
 * For "Contact for Price" orders: once the owner knows the real shipping
 * cost, this creates a standalone Stripe Checkout Session for just that
 * amount and emails the customer a payment link. Can be called again to
 * correct the amount before it's paid — each call creates a fresh session
 * and overwrites the previous one.
 */
export async function sendShippingQuote(
  orderId: string,
  amountDollars: number
): Promise<{ error: string } | { ok: true }> {
  if (!Number.isFinite(amountDollars) || amountDollars <= 0) {
    return { error: "Enter a shipping amount greater than $0." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { error: "Order not found." };
  if (!order.needsShippingQuote) return { error: "This order doesn't need a shipping quote." };
  if (order.shippingQuotePaidAt) return { error: "Shipping has already been paid for this order." };

  const quoteCents = Math.round(amountDollars * 100);
  const origin = await getSiteOrigin();
  const itemNames = order.items.map((i) => i.nameSnapshot).join(", ");

  // If a quote was already sent (e.g. the amount needs correcting), expire
  // that old payment link so the customer can't pay both by mistake.
  if (order.shippingQuoteCheckoutSessionId) {
    try {
      await stripe.checkout.sessions.expire(order.shippingQuoteCheckoutSessionId);
    } catch (error) {
      console.error("Failed to expire previous shipping quote session (may already be expired/paid):", error);
    }
  }

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: quoteCents,
            product_data: { name: `Shipping — ${itemNames}` },
          },
        },
      ],
      metadata: { orderId: order.id, kind: "shipping_quote" },
      success_url: `${origin}/checkout/confirmation/${order.id}?shipping_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/confirmation/${order.id}`,
    });
  } catch (error) {
    console.error("Failed to create shipping quote checkout session:", error);
    return { error: "Couldn't create a payment link with Stripe. Please try again." };
  }

  if (!session.url) {
    return { error: "Couldn't create a payment link with Stripe. Please try again." };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      shippingQuoteCents: quoteCents,
      shippingQuoteCheckoutSessionId: session.id,
      shippingQuoteSentAt: new Date(),
    },
  });

  await sendShippingQuoteEmail(order, session.url, quoteCents);

  safeRevalidatePath("/", "layout");
  return { ok: true };
}
