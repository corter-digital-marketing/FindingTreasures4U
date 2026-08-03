import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, PackageCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { categoryLabel, CATEGORIES } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} | Finding Treasures 4 U`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product.slug, 4);
  const categoryMeta = CATEGORIES.find((c) => c.value === product.category);

  const specs = [
    { label: "Dimensions", value: product.dimensions },
    { label: "Condition", value: product.condition },
  ].filter((s) => s.value);

  return (
    <div>
      <Container className="pt-6">
        <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[12px] text-charcoal-soft">
          <Link href="/products" className="shrink-0 hover:text-bronze-dark">
            All Products
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" strokeWidth={1.5} />
          <Link href={`/products/${categoryMeta?.slug}`} className="shrink-0 hover:text-bronze-dark">
            {categoryLabel(product.category)}
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" strokeWidth={1.5} />
          <span className="text-charcoal">{product.name}</span>
        </nav>
      </Container>

      <Container className="pt-8 pb-20 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <ProductGallery images={product.images} name={product.name} sold={product.sold} />

          <div className="lg:pt-2 lg:max-w-lg">
            <p className="text-[11px] tracking-[0.2em] uppercase text-bronze-dark mb-3">
              {categoryLabel(product.category)}
            </p>
            <h1 className="font-serif-display text-[2.25rem] md:text-[2.75rem] leading-[1.08] text-charcoal">
              {product.name}
            </h1>
            <p className="mt-5 text-[22px] text-charcoal tabular-nums">
              {formatPrice(product.priceCents)}
            </p>

            <div className="mt-8">
              <AddToCartButton
                sold={product.sold}
                item={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  priceCents: product.priceCents,
                  image: product.images[0]?.url ?? null,
                  category: product.category,
                }}
              />
            </div>

            <div className="hairline mt-10 mb-8" />

            <p className="text-[15px] leading-relaxed text-charcoal-soft whitespace-pre-line">
              {product.description}
            </p>

            {specs.length > 0 && (
              <dl className="mt-8 divide-y divide-line-soft border-t border-b border-line-soft">
                {specs.map((s) => (
                  <div key={s.label} className="flex py-3.5 gap-6 text-[13px]">
                    <dt className="w-32 shrink-0 tracking-[0.06em] uppercase text-charcoal-soft">
                      {s.label}
                    </dt>
                    <dd className="text-charcoal">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-8 flex items-start gap-3 text-[13px] text-charcoal-soft">
              <PackageCheck className="w-5 h-5 mt-0.5 text-bronze-dark shrink-0" strokeWidth={1.25} />
              <p className="leading-relaxed">
                Ships fully insured in custom-built packing, typically within 5–7 business days of
                order confirmation. International shipping available — duties and taxes are the
                buyer&apos;s responsibility.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section className="border-t border-line py-16 md:py-20">
          <Container>
            <h2 className="font-serif-display text-2xl md:text-3xl text-charcoal mb-10">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
