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
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { products, totalPages } = await getProductsPage({ page });

  return (
    <div>
      <section className="border-b border-line py-14 md:py-20">
        <Container>
          <p className="text-[11px] tracking-[0.24em] uppercase text-bronze-dark mb-3">
            The Full Collection
          </p>
          <h1 className="font-serif-display text-4xl md:text-[3rem] text-charcoal max-w-2xl">
            All Products
          </h1>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          {products.length === 0 ? (
            <p className="text-charcoal-soft text-sm">
              New treasures are on their way — please check back soon.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
                {products.map((p, i) => (
                  <ProductCard key={p.slug} product={p} priority={i < 4} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} basePath="/products" />
            </>
          )}
        </Container>
      </section>
    </div>
  );
}
