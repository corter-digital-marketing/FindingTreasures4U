"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/(dashboard)/orders/actions";

// Only paid orders are listed, so "awaiting payment" is never a valid choice.
const STATUSES = ["PAID", "FULFILLED", "CANCELLED"];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateOrderStatus(orderId, e.target.value))}
      className="border border-line bg-transparent px-2.5 py-1.5 text-[11px] tracking-[0.08em] uppercase text-charcoal outline-none focus:border-bronze-dark disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
