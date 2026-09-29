import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Truck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";
import { buttonClassName } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { formatPrice, formatDate } from "@/lib/format";
import { STORE_ADDRESS } from "@/lib/store";

async function getShippingQuotePaymentUrl(sessionId: string): Promise<string | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    // Only useful while still open — an expired/completed session's URL
    // won't accept a new payment.
    return session.status === "open" ? (session.url ?? null) : null;
  } catch (error) {
    console.error("Failed to retrieve shipping quote session:", error);
    return null;
  }
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) notFound();

  // Stripe's webhook is what actually confirms payment, and it can arrive
  // a beat after the browser redirect back here — so this page shouldn't
  // assume "paid" just because the customer reached it.
  const isPaid = order.status === "PAID" || order.status === "FULFILLED";
  const isPickup = order.deliveryMethod === "PICKUP";

  const shippingQuotePaymentUrl =
    order.needsShippingQuote && order.shippingQuoteSentAt && !order.shippingQuotePaidAt && order.shippingQuoteCheckoutSessionId
      ? await getShippingQuotePaymentUrl(order.shippingQuoteCheckoutSessionId)
      : null;

  return (
    <Container className="py-20 md:py-28 max-w-2xl">
      {isPaid && <ClearCartOnMount />}

      {isPaid ? (
        <>
          <CheckCircle2 className="w-9 h-9 text-bronze-dark mb-6" strokeWidth={1.25} />
          <p className="text-[11px] tracking-[0.24em] uppercase text-bronze-dark mb-3">
            Payment Confirmed
          </p>
          <h1 className="font-serif-display text-4xl md:text-[3rem] text-charcoal leading-tight">
            Thank you, {order.customerName.split(" ")[0]}.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-charcoal-soft">
            Your payment has been received and the piece{order.items.length > 1 ? "s" : ""} below
            are reserved for you. A confirmation has been sent to{" "}
            <span className="text-charcoal">{order.email}</span>, and we&apos;ll be in touch to
            {isPickup ? " arrange a pickup time." : " arrange shipping."}
          </p>
        </>
      ) : (
        <>
          <Clock className="w-9 h-9 text-bronze-dark mb-6" strokeWidth={1.25} />
          <p className="text-[11px] tracking-[0.24em] uppercase text-bronze-dark mb-3">
            Confirming Payment
          </p>
          <h1 className="font-serif-display text-4xl md:text-[3rem] text-charcoal leading-tight">
            Almost there, {order.customerName.split(" ")[0]}.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-charcoal-soft">
            We&apos;re confirming your payment now — this usually takes just a few seconds. Refresh
            this page in a moment, or check <span className="text-charcoal">{order.email}</span>{" "}
            for a confirmation email once it clears.
          </p>
        </>
      )}

      <div className="mt-10 border-t border-line">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-4 border-b border-line-soft text-[14px]"
          >
            <span className="text-charcoal">{item.nameSnapshot}</span>
            <span className="text-charcoal-soft tabular-nums">{formatPrice(item.priceCents)}</span>
          </div>
        ))}
        {order.shippingCents > 0 && (
          <div className="flex items-center justify-between py-4 border-b border-line-soft text-[14px]">
            <span className="text-charcoal">Shipping</span>
            <span className="text-charcoal-soft tabular-nums">
              {formatPrice(order.shippingCents)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between py-4 text-[15px]">
          <span className="text-charcoal">Total</span>
          <span className="text-charcoal tabular-nums">{formatPrice(order.totalCents)}</span>
        </div>
      </div>

      {isPaid && order.needsShippingQuote && (
        <div className="mt-8 border border-line bg-ivory-dim p-6">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 mt-0.5 text-bronze-dark shrink-0" strokeWidth={1.25} />
            <div>
              <h2 className="text-[13px] tracking-[0.06em] uppercase text-charcoal mb-1.5">
                Shipping
              </h2>
              {order.shippingQuotePaidAt ? (
                <p className="text-[14px] text-charcoal-soft">
                  Shipping payment of{" "}
                  <span className="text-charcoal">{formatPrice(order.shippingQuoteCents ?? 0)}</span>{" "}
                  received — thank you. We&apos;ll be in touch to arrange delivery.
                </p>
              ) : order.shippingQuoteSentAt ? (
                <>
                  <p className="text-[14px] text-charcoal-soft">
                    Shipping for this order is{" "}
                    <span className="text-charcoal">{formatPrice(order.shippingQuoteCents ?? 0)}</span>.
                    We&apos;ve emailed {order.email} a secure payment link.
                  </p>
                  {shippingQuotePaymentUrl && (
                    <a href={shippingQuotePaymentUrl} className={buttonClassName("primary", "mt-4")}>
                      Pay Shipping Now
                    </a>
                  )}
                </>
              ) : (
                <p className="text-[14px] text-charcoal-soft">
                  This piece requires special shipping arrangements. We&apos;ll be in touch soon
                  with a shipping cost and a secure payment link.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 text-[13px]">
        <div>
          <h2 className="text-[11px] tracking-[0.14em] uppercase text-charcoal-soft mb-2">
            Order Reference
          </h2>
          <p className="text-charcoal">{order.id}</p>
          <p className="text-charcoal-soft mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <h2 className="text-[11px] tracking-[0.14em] uppercase text-charcoal-soft mb-2">
            {isPickup ? "Pickup At" : "Shipping To"}
          </h2>
          {isPickup ? (
            <p className="text-charcoal leading-relaxed">Finding Treasures 4 U<br />{STORE_ADDRESS}</p>
          ) : (
            <p className="text-charcoal leading-relaxed">
              {order.addressLine1}
              {order.addressLine2 ? `, ${order.addressLine2}` : ""}
              <br />
              {order.city}, {order.region} {order.postalCode}
              <br />
              {order.country}
            </p>
          )}
        </div>
      </div>

      <Link
        href="/products"
        className="link-underline mt-12 inline-flex items-center gap-1.5 text-[13px] tracking-[0.14em] uppercase text-charcoal"
      >
        Continue Browsing
      </Link>
    </Container>
  );
}
