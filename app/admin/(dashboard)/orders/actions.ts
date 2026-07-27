"use server";

import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/app/generated/prisma";
import { safeRevalidatePath } from "@/lib/revalidate";

const VALID_STATUSES: OrderStatus[] = ["AWAITING_PAYMENT", "PAID", "FULFILLED", "CANCELLED"];

export async function updateOrderStatus(orderId: string, status: string) {
  if (!VALID_STATUSES.includes(status as OrderStatus)) return;
  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });
  safeRevalidatePath("/", "layout");
}
