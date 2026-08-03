import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ProductCard, type ProductCardData } from "@/components/product-card";

export function CategoryRow({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: ProductCardData[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="pb-14 md:pb-20">
      <Container>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-serif-display text-2xl md:text-[2rem] text-charcoal">{title}</h2>
          </div>
          <Link
            href={href}
            className="link-underline hidden sm:inline-flex items-center gap-1.5 text-[12px] tracking-[0.14em] uppercase text-charcoal"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}
