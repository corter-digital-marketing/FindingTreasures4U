"use client";

import { useRouter } from "next/navigation";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/components/cart-provider";

export function AddToCartButton({ item, sold }: { item: CartItem; sold: boolean }) {
  const { addItem, hasItem, ready } = useCart();
  const router = useRouter();
  const inCart = ready && hasItem(item.id);

  if (sold) {
    return (
      <Button variant="secondary" disabled className="w-full sm:w-auto">
        Sold
      </Button>
    );
  }

  if (inCart) {
    return (
      <Button variant="secondary" onClick={() => router.push("/cart")} className="w-full sm:w-auto">
        <Check className="w-4 h-4" strokeWidth={1.75} />
        In Your Cart — View Cart
      </Button>
    );
  }

  return (
    <Button onClick={() => addItem(item)} disabled={!ready} className="w-full sm:w-auto">
      <ShoppingBag className="w-4 h-4" strokeWidth={1.75} />
      Add to Cart
    </Button>
  );
}
