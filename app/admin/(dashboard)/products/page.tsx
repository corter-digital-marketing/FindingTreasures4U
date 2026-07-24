import Link from "next/link";
import NextImage from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, categoryBySlug, categoryLabel } from "@/lib/categories";
import { formatPrice } from "@/lib/format";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;
  const activeCategory = categorySlug ? categoryBySlug(categorySlug) : undefined;

  const products = await prisma.product.findMany({
    where: activeCategory ? { category: activeCategory.value } : undefined,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-bronze-dark mb-2">
            Catalog
          </p>
          <h1 className="font-serif-display text-3xl text-charcoal">Products</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-oxblood text-ivory px-5 py-3 text-[13px] uppercase tracking-[0.1em] hover:bg-oxblood-dark transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={1.75} />
          Add Product
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-10">
        <Link
          href="/admin/products"
          className={`px-4 py-2 text-[12px] uppercase tracking-[0.08em] border transition-colors ${
            !activeCategory
              ? "border-charcoal bg-charcoal text-ivory"
              : "border-line text-charcoal-soft hover:border-bronze-dark hover:text-charcoal"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/admin/products?category=${c.slug}`}
            className={`px-4 py-2 text-[12px] uppercase tracking-[0.08em] border transition-colors ${
              activeCategory?.slug === c.slug
                ? "border-charcoal bg-charcoal text-ivory"
                : "border-line text-charcoal-soft hover:border-bronze-dark hover:text-charcoal"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-[13px] text-charcoal-soft">
          {activeCategory
            ? `No ${activeCategory.label.toLowerCase()} yet.`
            : 'No products yet. Click "Add Product" to publish your first piece.'}
        </p>
      ) : (
        <div className="border border-line bg-paper">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/admin/products/${p.id}/edit`}
              className="flex items-center gap-4 px-5 py-4 border-b border-line last:border-none hover:bg-ivory-dim transition-colors"
            >
              <div className="relative w-14 h-14 shrink-0 bg-ivory-dim">
                {p.images[0] && (
                  <NextImage
                    src={p.images[0].url}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-charcoal truncate">{p.name}</p>
                <p className="text-[12px] text-charcoal-soft mt-0.5">
                  {categoryLabel(p.category)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {p.sold && (
                  <span className="text-[10px] tracking-[0.1em] uppercase text-ivory bg-charcoal px-2 py-1">
                    Sold
                  </span>
                )}
                <span className="text-[14px] text-charcoal tabular-nums w-20 text-right">
                  {formatPrice(p.priceCents)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
