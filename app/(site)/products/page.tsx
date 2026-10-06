import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product-card";
import { Pagination } from "@/components/ui/pagination";
import { getProductsPage } from "@/lib/products";

export const metadata: Metadata = {
  title: "All Products | Finding Treasures 4 U",
  description:
    "Browse our full collection of authenticated antiques, furnishings, weathervanes, and collectables.",
};

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q: queryParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const query = queryParam?.trim().slice(0, 100) ?? "";
  const { products, totalPages, totalCount } = await getProductsPage({ page, query });

  const basePath = query ? `/products?q=${encodeURIComponent(query)}` : "/products";

  return (
    <div>
      <section className="border-b border-line py-14 md:py-20">
        <Container>
          <p className="text-[11px] tracking-[0.24em] uppercase text-bronze-dark mb-3">
            {query ? "Search" : "The Full Collection"}
          </p>
          <h1 className="font-serif-display text-4xl md:text-[3rem] text-charcoal max-w-2xl">
            {query ? `Results for “${query}”` : "All Products"}
          </h1>
          {query && (
            <p className="mt-4 text-[13px] text-charcoal-soft">
              {totalCount} {totalCount === 1 ? "piece" : "pieces"} found
            </p>
          )}
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          {products.length === 0 ? (
            <p className="text-charcoal-soft text-sm">
              {query
                ? "Nothing matched that search. Try a different word, or browse the full collection."
                : "New treasures are on their way — please check back soon."}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
                {products.map((p, i) => (
                  <ProductCard key={p.slug} product={p} priority={i < 4} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} basePath={basePath} />
            </>
          )}
        </Container>
      </section>
    </div>
  );
}
