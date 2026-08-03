import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";
import type { Category } from "@/app/generated/prisma";

export type ProductCardData = {
  slug: string;
  name: string;
  priceCents: number;
  category: Category;
  sold: boolean;
  image: string | null;
};

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="img-zoom relative aspect-[4/5] bg-ivory-dim">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal-soft text-sm">
            No image
          </div>
        )}
        {product.sold && (
          <div className="absolute top-3 left-3 bg-charcoal/90 text-ivory text-[10px] tracking-[0.16em] uppercase px-3 py-1.5">
            Sold
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-[9px] tracking-[0.16em] uppercase text-bronze-dark mb-1">
          {categoryLabel(product.category)}
        </p>
        <h3 className="font-serif-display text-[16px] leading-snug text-charcoal group-hover:text-oxblood transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-[13px] text-charcoal-soft tabular-nums">
          {formatPrice(product.priceCents)}
        </p>
      </div>
    </Link>
  );
}
