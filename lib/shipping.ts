import type { ShippingTier } from "@/app/generated/prisma";

/**
 * Fixed shipping rates by item size. These are the only shipping amounts the
 * site charges automatically — admins pick a size, not a dollar figure, so
 * the rate can't drift or be mistyped. CONTACT items have no automatic rate
 * (stored as 0): they're still bought normally at checkout for the item
 * price, but shipping is quoted and charged separately afterward — see
 * Order.needsShippingQuote and the admin "Send Shipping Quote" action.
 */
export const SHIPPING_TIERS: {
  value: ShippingTier;
  label: string;
  shortLabel: string;
  cents: number | null;
}[] = [
  { value: "FREE", label: "Free Shipping", shortLabel: "Free", cents: 0 },
  { value: "SMALL", label: "Small — $16.90 shipping", shortLabel: "Small", cents: 1690 },
  { value: "MEDIUM", label: "Medium — $39.80 shipping", shortLabel: "Medium", cents: 3980 },
  { value: "LARGE", label: "Large — $45.65 shipping", shortLabel: "Large", cents: 4565 },
  {
    value: "CONTACT",
    label: "Really Big Item — shipping quoted after purchase",
    shortLabel: "Contact for shipping",
    cents: null,
  },
];

export function shippingCentsForTier(tier: ShippingTier): number {
  return SHIPPING_TIERS.find((t) => t.value === tier)?.cents ?? 0;
}
