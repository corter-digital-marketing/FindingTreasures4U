"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Field, TextAreaField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import { STORE_ADDRESS } from "@/lib/store";
import { submitOrder } from "./actions";

export default function CheckoutPage() {
  const { items, subtotalCents, shippingCents: cartShippingCents, ready } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<"SHIPPING" | "PICKUP">("SHIPPING");
  const isPickup = deliveryMethod === "PICKUP";
  // Display only — the server recomputes shipping from the database.
  const shippingCents = isPickup ? 0 : cartShippingCents;
  const totalCents = subtotalCents + shippingCents;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      items: items.map((i) => i.id),
      customerName: String(formData.get("customerName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      deliveryMethod,
      addressLine1: String(formData.get("addressLine1") ?? ""),
      addressLine2: String(formData.get("addressLine2") ?? ""),
      city: String(formData.get("city") ?? ""),
      region: String(formData.get("region") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      country: String(formData.get("country") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    };

    const result = await submitOrder(payload);

    if ("error" in result) {
      setSubmitting(false);
      setError(result.error);
      return;
    }

    // Don't clear the cart yet — the customer hasn't paid until they
    // complete Stripe's page. The cart only empties once the confirmation
    // page confirms the order actually paid (see ClearCartOnMount there).
    // Full navigation (not router.push) since this leaves our domain.
    window.location.href = result.checkoutUrl;
  }

  if (ready && items.length === 0) {
    return (
      <Container className="py-20 md:py-28">
        <p className="text-[15px] text-charcoal-soft">
          Your cart is empty, so there&apos;s nothing to check out yet.
        </p>
        <Link
          href="/products"
          className="link-underline mt-6 inline-flex items-center gap-1.5 text-[13px] tracking-[0.14em] uppercase text-charcoal"
        >
          Browse the Collection <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-14 md:py-20">
      <p className="text-[11px] tracking-[0.24em] uppercase text-bronze-dark mb-3">
        Secure Checkout
      </p>
      <h1 className="font-serif-display text-4xl md:text-[3rem] text-charcoal mb-10">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <fieldset>
            <legend className="font-serif-display text-xl text-charcoal mb-5">Delivery</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  {
                    value: "SHIPPING",
                    title: "Ship to me",
                    detail:
                      cartShippingCents > 0
                        ? `${formatPrice(cartShippingCents)} shipping`
                        : "Free shipping",
                  },
                  {
                    value: "PICKUP",
                    title: "Pick up in store",
                    detail: `Free · ${STORE_ADDRESS}`,
                  },
                ] as const
              ).map((option) => {
                const selected = deliveryMethod === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                      selected
                        ? "border-charcoal bg-ivory-dim"
                        : "border-line hover:border-bronze-dark"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={option.value}
                      checked={selected}
                      onChange={() => setDeliveryMethod(option.value)}
                      className="mt-1 accent-oxblood"
                    />
                    <span>
                      <span className="block text-[14px] text-charcoal">{option.title}</span>
                      <span className="mt-0.5 block text-[12px] text-charcoal-soft">
                        {option.detail}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-serif-display text-xl text-charcoal mb-5">
              Contact Information
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <Field label="Full Name" name="customerName" required autoComplete="name" />
              <Field label="Email" name="email" type="email" required autoComplete="email" />
              <Field
                label="Phone (optional)"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="sm:col-span-2"
              />
            </div>
          </fieldset>

          {!isPickup && (
            <fieldset>
              <legend className="font-serif-display text-xl text-charcoal mb-5">
                Shipping Address
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <Field
                  label="Address Line 1"
                  name="addressLine1"
                  required
                  autoComplete="address-line1"
                  className="sm:col-span-2"
                />
                <Field
                  label="Address Line 2 (optional)"
                  name="addressLine2"
                  autoComplete="address-line2"
                  className="sm:col-span-2"
                />
                <Field label="City" name="city" required autoComplete="address-level2" />
                <Field label="State / Region" name="region" required autoComplete="address-level1" />
                <Field label="Postal Code" name="postalCode" required autoComplete="postal-code" />
                <Field label="Country" name="country" required autoComplete="country-name" />
              </div>
            </fieldset>
          )}

          <fieldset>
            <legend className="font-serif-display text-xl text-charcoal mb-5">
              Notes (optional)
            </legend>
            <TextAreaField
              label="Anything we should know?"
              name="notes"
              placeholder="Delivery instructions, questions about a piece, etc."
            />
          </fieldset>
        </div>

        <div className="order-first lg:order-none lg:col-span-1">
          <div className="lg:sticky lg:top-28 bg-ivory-dim p-7">
            <h2 className="font-serif-display text-xl text-charcoal mb-5">Order Summary</h2>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-14 h-14 shrink-0 bg-ivory">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <p className="flex-1 min-w-0 break-words text-[13px] text-charcoal leading-snug">
                    {item.name}
                  </p>
                  <p className="text-[13px] text-charcoal-soft tabular-nums shrink-0">
                    {formatPrice(item.priceCents)}
                  </p>
                </div>
              ))}
            </div>

            <div className="hairline my-5" />

            <div className="flex items-center justify-between text-[14px] text-charcoal">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotalCents)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[14px] text-charcoal">
              <span>{isPickup ? "Store pickup" : "Shipping"}</span>
              <span className="tabular-nums">
                {shippingCents > 0 ? formatPrice(shippingCents) : "Free"}
              </span>
            </div>
            <div className="hairline my-4" />
            <div className="flex items-center justify-between text-[15px] text-charcoal">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(totalCents)}</span>
            </div>

            {error && (
              <p className="mt-4 text-[13px] text-oxblood" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting || !ready} className="w-full mt-6">
              {submitting ? "Redirecting to payment…" : "Continue to Payment"}
            </Button>
            <p className="mt-4 text-[11px] leading-relaxed text-charcoal-soft">
              You&apos;ll securely enter your card details on the next page via Stripe. Your card
              is charged once payment completes there.
            </p>
          </div>
        </div>
      </form>
    </Container>
  );
}
