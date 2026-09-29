import { Phone } from "lucide-react";
import { STORE_PHONE } from "@/lib/store";

// A secondary option alongside Add to Cart for large/awkward items — the
// primary path is now "buy now, we'll email a shipping payment link once
// it's arranged," but some customers would rather just call and sort out
// shipping directly instead.
export function ContactToPurchase() {
  if (!STORE_PHONE) return null;
  const telHref = `tel:${STORE_PHONE.replace(/[^\d+]/g, "")}`;

  return (
    <p className="mt-3 text-[12px] leading-relaxed text-charcoal-soft max-w-sm">
      Due to its size, shipping for this piece will be quoted and charged separately after
      purchase — we&apos;ll email you a secure payment link once it&apos;s arranged. Prefer to
      sort it out directly?{" "}
      <a href={telHref} className="link-underline inline-flex items-center gap-1 text-charcoal">
        <Phone className="w-3 h-3" strokeWidth={1.75} />
        Call {STORE_PHONE}
      </a>
    </p>
  );
}
