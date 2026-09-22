import type { ShippingTier } from "@/app/generated/prisma";

/**
 * Fixed shipping rates by item size. These are the only shipping amounts the
 * site ever charges — admins pick a size, not a dollar figure, so the rate
 * can't drift or be mistyped. CONTACT items have no automatic rate: they
 * can't be bought online at all, only inquired about (see isPurchasableTier).
 */
export const SHIPPING_TIERS: {
  value: ShippingTier;
  label: string;
  shortLabel: string;
  cents: number | null;
}[] = [
  { value: "SMALL", label: "Small — $16.90 shipping", shortLabel: "Small", cents: 1690 },
  { value: "MEDIUM", label: "Medium — $39.80 shipping", shortLabel: "Medium", cents: 3980 },
  { value: "LARGE", label: "Large — $45.65 shipping", shortLabel: "Large", cents: 4565 },
  {
    value: "CONTACT",
    label: "Really Big Item — contact required, not sold online",
    shortLabel: "Contact for shipping",
    cents: null,
  },
];

export function shippingCentsForTier(tier: ShippingTier): number {
  return SHIPPING_TIERS.find((t) => t.value === tier)?.cents ?? 0;
}

export function isPurchasableTier(tier: ShippingTier): boolean {
  return tier !== "CONTACT";
}
