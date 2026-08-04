import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product-card";
import { Pagination } from "@/components/ui/pagination";
import { CATEGORIES, categoryBySlug } from "@/lib/categories";
import { getProductsPage } from "@/lib/products";

const DESCRIPTIONS: Record<string, string> = {
  furnishings:
    "Case pieces, seating, and tables — solid, storied furniture built to be lived with for another century.",
  weathervanes:
    "Sculptural copper and cast forms, from full-bodied roosters to running horses, ready for display indoors.",
  collectables:
    "Silver, porcelain, rugs, clocks, and other fine objects for the cabinet, table, or floor.",
  artworks:
    "Original paintings, prints, and works on paper — framed pieces with history and presence.",
};

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.label} | Finding Treasures 4 U`,
    description: DESCRIPTIONS[category.slug],
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { category: slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) notFound();

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { products, totalPages } = await getProductsPage({ category: category.value, page });

  return (
    <div>
      <section className="border-b border-line py-14 md:py-20">
        <Container>
          <p className="text-[11px] tracking-[0.24em] uppercase text-bronze-dark mb-3">
            Shop by Category
          </p>
          <h1 className="font-serif-display text-4xl md:text-[3rem] text-charcoal max-w-2xl">
            {category.label}
          </h1>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          {products.length === 0 ? (
            <p className="text-charcoal-soft text-sm">
              No {category.label.toLowerCase()} are available right now — please check back soon.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
                {products.map((p, i) => (
                  <ProductCard key={p.slug} product={p} priority={i < 4} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} basePath={`/products/${category.slug}`} />
            </>
          )}
        </Container>
      </section>
    </div>
  );
}
