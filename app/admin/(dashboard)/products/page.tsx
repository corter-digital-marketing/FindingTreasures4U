import Link from "next/link";
import NextImage from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, categoryBySlug, categoryLabel } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { Pagination } from "@/components/ui/pagination";
import type { Prisma } from "@/app/generated/prisma";

const PAGE_SIZE = 50;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string; page?: string; q?: string }>;
}) {
  const { category: categorySlug, status, page: pageParam, q: queryParam } = await searchParams;
  const activeCategory = categorySlug ? categoryBySlug(categorySlug) : undefined;
  const activeStatus =
    status === "draft" || status === "published" || status === "sold" ? status : undefined;
  const page = Math.max(1, Number(pageParam) || 1);
  const query = queryParam?.trim().slice(0, 100) ?? "";

  const where: Prisma.ProductWhereInput = {
    ...(activeCategory ? { category: activeCategory.value } : {}),
    ...(activeStatus === "sold"
      ? { sold: true }
      : activeStatus
        ? { published: activeStatus === "published" }
        : {}),
    ...(query && { name: { contains: query, mode: "insensitive" } }),
  };

  const [products, totalCount, draftCount, soldCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: activeStatus === "sold" ? { updatedAt: "desc" } : { createdAt: "desc" },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.product.count({ where: { published: false } }),
    prisma.product.count({ where: { sold: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const filterParams = new URLSearchParams();
  if (activeCategory) filterParams.set("category", activeCategory.slug);
  if (activeStatus) filterParams.set("status", activeStatus);
  const clearSearchHref =
    filterParams.size > 0 ? `/admin/products?${filterParams.toString()}` : "/admin/products";

  const params = new URLSearchParams(filterParams);
  if (query) params.set("q", query);
  const basePath = params.size > 0 ? `/admin/products?${params.toString()}` : "/admin/products";

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-bronze-dark mb-2">
            Catalog
          </p>
          <h1 className="font-serif-display text-3xl text-charcoal">
            Products <span className="text-charcoal-soft font-sans text-base">({totalCount})</span>
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-oxblood text-ivory px-5 py-3 text-[13px] uppercase tracking-[0.1em] hover:bg-oxblood-dark transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={1.75} />
          Add Product
        </Link>
      </div>

      <form action="/admin/products" method="get" className="mb-6 max-w-sm">
        {activeCategory && <input type="hidden" name="category" value={activeCategory.slug} />}
        {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search products by name…"
          className="w-full border-0 border-b border-line bg-transparent py-2 text-[14px] text-charcoal placeholder:text-charcoal-soft/70 outline-none transition-colors focus:border-bronze-dark"
        />
      </form>
      {query && (
        <p className="-mt-4 mb-6 text-[12px] text-charcoal-soft">
          {totalCount} result{totalCount === 1 ? "" : "s"} for &ldquo;{query}&rdquo; —{" "}
          <Link href={clearSearchHref} className="link-underline text-charcoal">
            Clear
          </Link>
        </p>
      )}

      {draftCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Link
            href={`/admin/products?status=draft${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            className={`px-4 py-2 text-[12px] uppercase tracking-[0.08em] border transition-colors ${
              activeStatus === "draft"
                ? "border-bronze-dark bg-bronze-dark text-ivory"
                : "border-bronze text-bronze-dark hover:bg-ivory-dim"
            }`}
          >
            Drafts ({draftCount}) — hidden from customers
          </Link>
          {activeStatus === "draft" && (
            <Link
              href={query ? `/admin/products?q=${encodeURIComponent(query)}` : "/admin/products"}
              className="text-[12px] text-charcoal-soft hover:text-charcoal link-underline"
            >
              Clear filter
            </Link>
          )}
        </div>
      )}
      {soldCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Link
            href={`/admin/products?status=sold${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            className={`px-4 py-2 text-[12px] uppercase tracking-[0.08em] border transition-colors ${
              activeStatus === "sold"
                ? "border-charcoal bg-charcoal text-ivory"
                : "border-line text-charcoal-soft hover:border-bronze-dark hover:text-charcoal"
            }`}
          >
            Sold ({soldCount})
          </Link>
          {activeStatus === "sold" && (
            <Link
              href={query ? `/admin/products?q=${encodeURIComponent(query)}` : "/admin/products"}
              className="text-[12px] text-charcoal-soft hover:text-charcoal link-underline"
            >
              Clear filter
            </Link>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 mb-10">
        <Link
          href={query ? `/admin/products?q=${encodeURIComponent(query)}` : "/admin/products"}
          className={`px-4 py-2 text-[12px] uppercase tracking-[0.08em] border transition-colors ${
            !activeCategory && !activeStatus
              ? "border-charcoal bg-charcoal text-ivory"
              : "border-line text-charcoal-soft hover:border-bronze-dark hover:text-charcoal"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/admin/products?category=${c.slug}${activeStatus ? `&status=${activeStatus}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
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
          {query
            ? `No products match "${query}".`
            : activeCategory
              ? `No ${activeCategory.label.toLowerCase()} yet.`
              : 'No products yet. Click "Add Product" to publish your first piece.'}
        </p>
      ) : (
        <>
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
                  {!p.published && (
                    <span className="text-[10px] tracking-[0.1em] uppercase text-ivory bg-bronze-dark px-2 py-1">
                      Draft
                    </span>
                  )}
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
          <Pagination page={page} totalPages={totalPages} basePath={basePath} />
        </>
      )}
    </div>
  );
}
