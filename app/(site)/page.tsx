import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product-card";
import { CategoryRow } from "@/components/category-row";
import { CATEGORIES } from "@/lib/categories";
import { getCategoryPreviewImage, getNewArrivals, getProductsByCategory } from "@/lib/products";

export default async function HomePage() {
  const [newArrivals, categoryImages, categoryProducts] = await Promise.all([
    getNewArrivals(4),
    Promise.all(CATEGORIES.map((c) => getCategoryPreviewImage(c.value))),
    Promise.all(CATEGORIES.map((c) => getProductsByCategory(c.value, 4))),
  ]);

  return (
    <div>
      {/* Editorial hero */}
      <section className="relative h-[56vh] min-h-[420px] max-h-[620px] w-full overflow-hidden">
        <Image
          src="https://placehold.co/2400x1500/2a2118/e9dfc9.png?text=Finding+Treasures&font=playfair-display"
          alt="A sun-lit interior styled with curated antique furnishings"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent" />
        <Container className="relative h-full flex flex-col justify-end pb-12 md:pb-16">
          <p className="text-[11px] tracking-[0.28em] uppercase text-ivory/70 mb-5">
            Est. Curators of Fine Antiques
          </p>
          <h1 className="font-serif-display text-ivory text-[2.25rem] leading-[1.05] sm:text-[2.75rem] md:text-[3.25rem] max-w-3xl">
            Antiques, uniques, and sought after items.
          </h1>
          <Link
            href="/products"
            className="link-underline mt-7 inline-flex w-fit items-center gap-2 text-[13px] tracking-[0.14em] uppercase text-ivory"
          >
            Explore the Collection
            <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </Container>
      </section>

      {/* Shop by category — 2x2 grid */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] tracking-[0.24em] uppercase text-bronze-dark mb-3">
                Browse the Collection
              </p>
              <h2 className="font-serif-display text-3xl md:text-[2.5rem] text-charcoal">
                Shop by Category
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/products/${cat.slug}`}
                className="group relative img-zoom block overflow-hidden aspect-[16/12]"
              >
                {categoryImages[i] ? (
                  <Image
                    src={categoryImages[i]!}
                    alt={cat.label}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  <div className="w-full h-full bg-ivory-dim" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/0 to-transparent" />
                <div className="absolute left-6 bottom-6 flex items-center gap-2 text-ivory">
                  <span className="font-serif-display text-2xl">{cat.label}</span>
                  <ArrowUpRight
                    className="w-5 h-5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                    strokeWidth={1.5}
                  />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* New arrivals */}
      <section className="pb-20 md:pb-28">
        <Container>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] tracking-[0.24em] uppercase text-bronze-dark mb-3">
                Just In
              </p>
              <h2 className="font-serif-display text-3xl md:text-[2.5rem] text-charcoal">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/products"
              className="link-underline hidden sm:inline-flex items-center gap-1.5 text-[12px] tracking-[0.14em] uppercase text-charcoal"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {newArrivals.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 2} />
            ))}
          </div>
        </Container>
      </section>

      {/* Per-category rows */}
      {CATEGORIES.map((cat, i) => (
        <CategoryRow
          key={cat.slug}
          eyebrow="Shop the Category"
          title={cat.label}
          href={`/products/${cat.slug}`}
          products={categoryProducts[i]}
        />
      ))}

      {/* About */}
      <section id="about" className="py-20 md:py-28">
        <Container className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative aspect-[4/5] order-2 md:order-1">
            <Image
              src="https://placehold.co/1000x1250/e9e0cb/352a20.png?text=Our+Workshop&font=playfair-display"
              alt="The Finding Treasures For You workshop"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div className="order-1 md:order-2 max-w-lg">
            <p className="text-[11px] tracking-[0.24em] uppercase text-bronze-dark mb-3">
              About Us
            </p>
            <h2 className="font-serif-display text-3xl md:text-[2.5rem] text-charcoal leading-tight">
              A lifelong eye for what deserves a second life.
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-charcoal-soft">
              Finding Treasures For You began as a single stall at a Saturday estate sale and grew
              into a trusted source for authenticated antiques, folk art, and fine collectables.
              We personally research the history of every piece we offer — its maker, its era, its
              condition — so you can buy with confidence, wherever you are.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-charcoal-soft">
              Each item is cleaned, assessed, and carefully packed by hand before it leaves our
              workshop, and we&apos;re always happy to answer questions about provenance or condition
              before you buy.
            </p>
            <Link
              href="/products"
              className="link-underline mt-8 inline-flex items-center gap-1.5 text-[13px] tracking-[0.14em] uppercase text-charcoal"
            >
              Browse the Collection <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
