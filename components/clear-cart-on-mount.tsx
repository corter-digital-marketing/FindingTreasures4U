"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart-provider";

/**
 * Empties the cart once the customer lands on a confirmed-paid order page.
 * Deliberately not cleared any earlier than this (e.g. at checkout submit) —
 * if they abandon Stripe's payment page, their cart should still be there
 * when they come back.
 */
export function ClearCartOnMount() {
  const { clear } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
