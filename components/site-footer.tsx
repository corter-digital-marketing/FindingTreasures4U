import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-charcoal text-ivory/85">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-14 py-16 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
        <div className="col-span-2 md:col-span-1 pr-6">
          <span className="font-serif-display text-2xl text-ivory">
            Finding <em className="italic text-bronze-light">Treasures</em>
          </span>
          <p className="mt-4 text-[13px] leading-relaxed text-ivory/60 max-w-[26ch]">
            Antiques, uniques, and sought after items — carefully sourced, authenticated, and shipped
            worldwide.
          </p>
        </div>

        <div>
          <h3 className="text-[11px] tracking-[0.18em] uppercase text-ivory/50 mb-4">Shop</h3>
          <ul className="space-y-2.5 text-[13px]">
            <li>
              <Link href="/products" className="link-underline text-ivory/80 hover:text-bronze-light">
                All Products
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/products/${c.slug}`}
                  className="link-underline text-ivory/80 hover:text-bronze-light"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] tracking-[0.18em] uppercase text-ivory/50 mb-4">Information</h3>
          <ul className="space-y-2.5 text-[13px]">
            <li>
              <Link href="/#about" className="link-underline text-ivory/80 hover:text-bronze-light">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/cart" className="link-underline text-ivory/80 hover:text-bronze-light">
                Your Cart
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-[12px] leading-relaxed text-ivory/50 max-w-[26ch]">
            Ships fully insured, worldwide. Fourteen days to decide — full refund if a piece
            isn&apos;t right.
          </p>
        </div>

        <div>
          <h3 className="text-[11px] tracking-[0.18em] uppercase text-ivory/50 mb-4">Visit</h3>
          <p className="text-[13px] text-ivory/80 leading-relaxed">
            By appointment
            <br />
            hello@findingtreasuresforyou.com
          </p>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-14 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] tracking-[0.08em] text-ivory/45">
          <span>&copy; {new Date().getFullYear()} Finding Treasures 4 U. All rights reserved.</span>
          <span>Every piece hand-selected, one estate at a time.</span>
        </div>
      </div>
    </footer>
  );
}
