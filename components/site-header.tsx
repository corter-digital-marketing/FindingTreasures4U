"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShoppingCart, X } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { useCart } from "@/components/cart-provider";

const NAV_LINKS = [
  { href: "/products", label: "All Products" },
  ...CATEGORIES.map((c) => ({ href: `/products/${c.slug}`, label: c.label })),
  { href: "/#about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { items, ready } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-sm">
      <div className="hidden md:block bg-charcoal text-ivory/80">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-14 flex items-center justify-center gap-10 py-2 text-[11px] tracking-[0.16em] uppercase">
          <span>Authentic Pieces</span>
          <span className="w-1 h-1 rounded-full bg-ivory/30" />
          <span>In Person in Lock Haven, PA</span>
          <span className="w-1 h-1 rounded-full bg-ivory/30" />
          <span>Shipped Worldwide</span>
        </div>
      </div>

      <div className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-14">
          <div className="flex items-center justify-between py-5">
            <Link href="/" className="flex flex-col leading-none group min-w-0">
              <span className="font-serif-display text-[21px] sm:text-[26px] md:text-[28px] text-charcoal whitespace-nowrap">
                Finding <em className="italic text-bronze-dark">Treasures</em>
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.28em] sm:tracking-[0.32em] uppercase text-charcoal-soft mt-1">
                For You
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-9">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href !== "/#about" &&
                  (pathname === link.href ||
                    (link.href !== "/products" && pathname?.startsWith(link.href)));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`link-underline text-[12px] tracking-[0.14em] uppercase transition-colors ${
                      active ? "text-oxblood" : "text-charcoal hover:text-bronze-dark"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-5">
              <Link
                href="/cart"
                aria-label={`Cart, ${items.length} item${items.length === 1 ? "" : "s"}`}
                className="relative p-2 -mr-2 text-charcoal hover:text-bronze-dark transition-colors"
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                {ready && items.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-oxblood text-ivory text-[9px] leading-none">
                    {items.length}
                  </span>
                )}
              </Link>
              <button
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((v) => !v)}
                className="lg:hidden p-2 -mr-2 text-charcoal"
              >
                {open ? (
                  <X className="w-5 h-5" strokeWidth={1.5} />
                ) : (
                  <Menu className="w-5 h-5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-b border-line bg-ivory">
          <div className="mx-auto max-w-[1400px] px-6 flex flex-col py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[13px] tracking-[0.14em] uppercase text-charcoal border-b border-line-soft last:border-none"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
