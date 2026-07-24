"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validation";

export async function submitOrder(
  input: unknown
): Promise<{ orderId: string } | { error: string }> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const { items: itemIds, ...shipping } = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: itemIds } },
  });

  if (products.length !== itemIds.length) {
    return { error: "One or more items in your cart could not be found." };
  }

  const alreadySold = products.find((p) => p.sold);
  if (alreadySold) {
    return { error: `"${alreadySold.name}" has just sold and is no longer available.` };
  }

  const totalCents = products.reduce((sum, p) => sum + p.priceCents, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        ...shipping,
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

    await tx.product.updateMany({
      where: { id: { in: itemIds } },
      data: { sold: true },
    });

    return created;
  });

  revalidatePath("/", "layout");

  return { orderId: order.id };
}
