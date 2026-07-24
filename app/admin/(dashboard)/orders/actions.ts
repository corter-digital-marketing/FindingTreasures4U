"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/app/generated/prisma";

const VALID_STATUSES: OrderStatus[] = ["AWAITING_PAYMENT", "PAID", "FULFILLED", "CANCELLED"];

export async function updateOrderStatus(orderId: string, status: string) {
  if (!VALID_STATUSES.includes(status as OrderStatus)) return;
  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });
  revalidatePath("/", "layout");
}
