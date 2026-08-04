import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { safeRevalidatePath } from "@/lib/revalidate";
import { sendOrderConfirmationToCustomer, sendOrderNotificationToOwner } from "@/lib/email";

/**
 * Stripe sends this once a checkout session actually completes payment.
 * This — not the customer's browser redirect back to our success_url — is
 * the only trustworthy signal that money actually moved, so this is where
 * the order gets marked paid and the product gets marked sold. A customer
 * simply reaching the confirmation page proves nothing on its own; only
 * this webhook, verified by signature, does.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set — rejecting webhook.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.error("checkout.session.completed missing orderId in metadata:", session.id);
    return NextResponse.json({ received: true });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    console.error("Stripe webhook: no matching order for session", session.id, orderId);
    return NextResponse.json({ received: true });
  }

  // Stripe can deliver the same event more than once — don't double-process.
  if (order.status === "PAID" || order.status === "FULFILLED") {
    return NextResponse.json({ received: true });
  }

  const productIds = order.items
    .map((item) => item.productId)
    .filter((id): id is string => Boolean(id));

  // Rare edge case for one-of-a-kind items: if this product somehow already
  // sold (e.g. two overlapping checkouts), don't pretend everything's fine —
  // the payment still succeeded and can't be silently undone here, so this
  // needs a human to sort out (refund, contact customer, etc.).
  const alreadySold = await prisma.product.findMany({
    where: { id: { in: productIds }, sold: true },
    select: { name: true },
  });
  if (alreadySold.length > 0) {
    console.error(
      "STRIPE WEBHOOK: payment succeeded for already-sold product(s) — needs manual review.",
      { orderId, sessionId: session.id, products: alreadySold.map((p) => p.name) }
    );
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntentId,
      },
    }),
    prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { sold: true },
    }),
  ]);

  safeRevalidatePath("/", "layout");

  await Promise.all([
    sendOrderNotificationToOwner(order),
    sendOrderConfirmationToCustomer(order),
  ]);

  return NextResponse.json({ received: true });
}
