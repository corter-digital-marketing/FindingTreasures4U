"use client";

import { useState, type FormEvent } from "react";
import { sendShippingQuote } from "@/app/admin/(dashboard)/orders/actions";
import { formatPrice } from "@/lib/format";

type Props = {
  orderId: string;
  shippingQuoteCents: number | null;
  shippingQuoteSentAt: Date | null;
  shippingQuotePaidAt: Date | null;
};

export function ShippingQuoteForm({
  orderId,
  shippingQuoteCents,
  shippingQuoteSentAt,
  shippingQuotePaidAt,
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const amount = new FormData(e.currentTarget).get("amount");
    const result = await sendShippingQuote(orderId, Number(amount));
    setPending(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      setSent(true);
    }
  }

  if (shippingQuotePaidAt) {
    return (
      <p className="text-[12px] text-bronze-dark">
        Shipping paid: {formatPrice(shippingQuoteCents ?? 0)}
      </p>
    );
  }

  return (
    <div className="border-t border-line-soft pt-3 mt-3">
      {shippingQuoteSentAt && !sent ? (
        <p className="text-[12px] text-charcoal-soft mb-2">
          Quote sent: {formatPrice(shippingQuoteCents ?? 0)} — awaiting payment. Enter a new
          amount below to correct it (this cancels the previous payment link).
        </p>
      ) : sent ? (
        <p className="text-[12px] text-bronze-dark mb-2">Shipping quote sent to the customer.</p>
      ) : (
        <p className="text-[12px] text-charcoal-soft mb-2">
          This order needs a shipping quote — enter the cost once you know it.
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <span className="text-[13px] text-charcoal-soft">$</span>
        <input
          type="number"
          name="amount"
          min="0.01"
          step="0.01"
          required
          placeholder="0.00"
          className="w-24 border-0 border-b border-line bg-transparent py-1 text-[13px] text-charcoal outline-none focus:border-bronze-dark"
        />
        <button
          type="submit"
          disabled={pending}
          className="px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] border border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory transition-colors disabled:opacity-50"
        >
          {pending ? "Sending…" : shippingQuoteSentAt ? "Resend" : "Send Quote"}
        </button>
      </form>
      {error && (
        <p className="mt-1.5 text-[12px] text-oxblood" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
