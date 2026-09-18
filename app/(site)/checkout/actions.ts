"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validation";
import { stripe } from "@/lib/stripe";

async function getSiteOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    // headers() requires a real request context — falls back to an env var
    // for the rare case this runs outside one (e.g. a script or test).
    return process.env.SITE_URL ?? "http://localhost:3000";
  }
}

export async function submitOrder(
  input: unknown
): Promise<{ checkoutUrl: string } | { error: string }> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const { items: itemIds, deliveryMethod, ...contact } = parsed.data;
  const isPickup = deliveryMethod === "PICKUP";

  const products = await prisma.product.findMany({
    where: { id: { in: itemIds } },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  if (products.length !== itemIds.length) {
    return { error: "One or more items in your cart could not be found." };
  }

  const alreadySold = products.find((p) => p.sold);
  if (alreadySold) {
    return { error: `"${alreadySold.name}" has just sold and is no longer available.` };
  }

  // Shipping is summed from what's stored in the database, never from
  // anything the browser sent — the cart's copy is display-only.
  const subtotalCents = products.reduce((sum, p) => sum + p.priceCents, 0);
  // In-store pickup never pays shipping.
  const shippingCents = isPickup ? 0 : products.reduce((sum, p) => sum + p.shippingCents, 0);
  const totalCents = subtotalCents + shippingCents;

  // The order is created up front so we have something for the Stripe
  // session to reference, but products are NOT marked sold here — that only
  // happens once the webhook confirms payment actually succeeded. If the
  // customer abandons checkout, nothing is locked and the items stay
  // available to other buyers.
  const order = await prisma.order.create({
    data: {
      deliveryMethod,
      customerName: contact.customerName,
      email: contact.email,
      phone: contact.phone,
      notes: contact.notes,
      // Pickup orders have no delivery address; the columns are required, so
      // they're stored empty and everything that displays an address checks
      // deliveryMethod first.
      addressLine1: isPickup ? "" : (contact.addressLine1 ?? ""),
      addressLine2: isPickup ? "" : contact.addressLine2,
      city: isPickup ? "" : (contact.city ?? ""),
      region: isPickup ? "" : (contact.region ?? ""),
      postalCode: isPickup ? "" : (contact.postalCode ?? ""),
      country: isPickup ? "" : (contact.country ?? ""),
      shippingCents,
      totalCents,
      items: {
        create: products.map((p) => ({
          productId: p.id,
          nameSnapshot: p.name,
          priceCents: p.priceCents,
          quantity: 1,
        })),
      },
    },
  });

  const origin = await getSiteOrigin();

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: contact.email,
      line_items: products.map((p) => ({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: p.priceCents,
          product_data: {
            name: p.name,
            images: p.images[0] ? [p.images[0].url] : undefined,
          },
        },
      })),
      ...(shippingCents > 0 && {
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount" as const,
              display_name: "Shipping",
              fixed_amount: { amount: shippingCents, currency: "usd" },
            },
          },
        ],
      }),
      metadata: { orderId: order.id },
      success_url: `${origin}/checkout/confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });
  } catch (error) {
    console.error("Failed to create Stripe checkout session:", error);
    await prisma.order.delete({ where: { id: order.id } });
    return { error: "We couldn't start checkout with our payment provider. Please try again." };
  }

  if (!session.url) {
    await prisma.order.delete({ where: { id: order.id } });
    return { error: "We couldn't start checkout with our payment provider. Please try again." };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return { checkoutUrl: session.url };
}
