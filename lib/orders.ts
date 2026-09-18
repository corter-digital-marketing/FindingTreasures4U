import type { Prisma } from "@/app/generated/prisma";

/**
 * Orders that represent a real sale. Every checkout attempt creates an Order
 * before the customer reaches Stripe, so abandoned or never-completed
 * checkouts sit in the table as AWAITING_PAYMENT. Those shouldn't show up in
 * the admin — only orders that were actually paid.
 *
 * Matching on paidAt (set by the Stripe webhook) rather than the current
 * status means a paid order the owner later marks CANCELLED or refunds still
 * appears, since it was a real sale. Orders manually set to PAID/FULFILLED
 * (e.g. paid in person) are included too.
 */
export const PAID_ORDERS_WHERE: Prisma.OrderWhereInput = {
  OR: [{ paidAt: { not: null } }, { status: { in: ["PAID", "FULFILLED"] } }],
};
