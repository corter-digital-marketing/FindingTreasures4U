"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useCart } from "@/components/cart-provider";
import { categoryLabel } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import type { Category } from "@/app/generated/prisma";

export default function CartPage() {
  const { items, removeItem, subtotalCents, ready } = useCart();

  return (
    <Container className="py-14 md:py-20">
      <p className="text-[11px] tracking-[0.24em] uppercase text-bronze-dark mb-3">
        Your Selections
      </p>
      <h1 className="font-serif-display text-4xl md:text-[3rem] text-charcoal mb-10">Cart</h1>

      {!ready ? null : items.length === 0 ? (
        <div className="py-16 border-t border-line">
          <p className="text-[15px] text-charcoal-soft">
            Your cart is empty. Each piece in our collection is one of a kind — once you find
            something you love, it will appear here.
          </p>
          <Link
            href="/products"
            className="link-underline mt-6 inline-flex items-center gap-1.5 text-[13px] tracking-[0.14em] uppercase text-charcoal"
          >
            Browse the Collection <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 border-t border-line">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 sm:gap-5 py-6 border-b border-line-soft"
              >
                <Link
                  href={`/product/${item.slug}`}
                  className="relative w-16 h-16 sm:w-24 sm:h-24 shrink-0 bg-ivory-dim"
                >
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-[0.16em] uppercase text-bronze-dark mb-1">
                    {categoryLabel(item.category as Category)}
                  </p>
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-serif-display text-base sm:text-lg text-charcoal hover:text-oxblood transition-colors break-words"
                  >
                    {item.name}
                  </Link>
                </div>
                <p className="text-[14px] sm:text-[15px] text-charcoal tabular-nums shrink-0">
                  {formatPrice(item.priceCents)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="p-2 -mr-2 shrink-0 text-charcoal-soft hover:text-oxblood transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-ivory-dim p-7">
              <div className="flex items-center justify-between text-[14px] text-charcoal">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotalCents)}</span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-charcoal-soft">
                Shipping is calculated at checkout based on destination and item size.
              </p>
              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 bg-oxblood px-7 py-3.5 text-[13px] font-medium uppercase tracking-[0.14em] text-ivory transition-colors duration-300 hover:bg-oxblood-dark"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
