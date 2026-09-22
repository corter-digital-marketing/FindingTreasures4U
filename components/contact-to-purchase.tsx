import { Mail, Phone } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { STORE_EMAIL, STORE_PHONE } from "@/lib/store";

export function ContactToPurchase({ productName }: { productName: string }) {
  const subject = `Inquiry: ${productName}`;
  const body = `Hi, I'm interested in purchasing "${productName}". Could you tell me about shipping options and cost?`;
  const mailHref = `mailto:${STORE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const telHref = STORE_PHONE ? `tel:${STORE_PHONE.replace(/[^\d+]/g, "")}` : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3">
        {telHref && (
          <a href={telHref} className={buttonClassName("primary", "w-full sm:w-auto")}>
            <Phone className="w-4 h-4" strokeWidth={1.75} />
            Call {STORE_PHONE}
          </a>
        )}
        <a href={mailHref} className={buttonClassName("secondary", "w-full sm:w-auto")}>
          <Mail className="w-4 h-4" strokeWidth={1.75} />
          Email Instead
        </a>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-charcoal-soft max-w-sm">
        Due to its size, this piece requires special shipping arrangements and isn&apos;t sold
        automatically through the site. Reach out and we&apos;ll work out shipping (or in-store
        pickup) with you directly.
      </p>
    </div>
  );
}
