import { Phone } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { STORE_PHONE } from "@/lib/store";

export function ContactToPurchase() {
  const telHref = STORE_PHONE ? `tel:${STORE_PHONE.replace(/[^\d+]/g, "")}` : null;

  return (
    <div>
      {telHref && (
        <a href={telHref} className={buttonClassName("primary", "w-full sm:w-auto")}>
          <Phone className="w-4 h-4" strokeWidth={1.75} />
          Call {STORE_PHONE}
        </a>
      )}
      <p className="mt-3 text-[12px] leading-relaxed text-charcoal-soft max-w-sm">
        Due to its size, this piece requires special shipping arrangements and isn&apos;t sold
        automatically through the site. Call us and we&apos;ll work out shipping (or in-store
        pickup) with you directly.
      </p>
    </div>
  );
}
