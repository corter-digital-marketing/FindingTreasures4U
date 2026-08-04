import { prisma } from "@/lib/prisma";
import type { Category } from "@/app/generated/prisma";

const cardSelect = {
  slug: true,
  name: true,
  priceCents: true,
  category: true,
  sold: true,
  images: { orderBy: { position: "asc" as const }, take: 1 },
};

function toCard<T extends { images: { url: string }[] }>(p: T) {
  const { images, ...rest } = p;
  return { ...rest, image: images[0]?.url ?? null };
}

export async function getNewArrivals(take = 8) {
  const products = await prisma.product.findMany({
    where: { sold: false },
    orderBy: { createdAt: "desc" },
    take,
    select: cardSelect,
  });
  return products.map(toCard);
}

export async function getProductsByCategory(category: Category, take?: number) {
  const products = await prisma.product.findMany({
    where: { category },
    orderBy: [{ sold: "asc" }, { createdAt: "desc" }],
    take,
    select: cardSelect,
  });
  return products.map(toCard);
}

export async function getAllProducts() {
  const products = await prisma.product.findMany({
    orderBy: [{ sold: "asc" }, { createdAt: "desc" }],
    select: cardSelect,
  });
  return products.map(toCard);
}

export const PRODUCTS_PAGE_SIZE = 24;

/**
 * Paginated product listing, used by the /products and /products/[category]
 * pages so a catalog of hundreds of items doesn't load (and render) as one
 * unbounded page.
 */
export async function getProductsPage({
  category,
  page = 1,
  pageSize = PRODUCTS_PAGE_SIZE,
}: {
  category?: Category;
  page?: number;
  pageSize?: number;
}) {
  const where = category ? { category } : undefined;

  // Resolve the total count first so an out-of-range page (e.g. someone
  // editing ?page=99 by hand) clamps to the real last page instead of
  // coming back empty and showing a misleading "nothing here" state.
  const totalCount = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ sold: "asc" }, { createdAt: "desc" }],
    select: cardSelect,
    skip: (safePage - 1) * pageSize,
    take: pageSize,
  });

  return {
    products: products.map(toCard),
    totalCount,
    totalPages,
    page: safePage,
  };
}

export async function getCategoryPreviewImage(category: Category) {
  const product = await prisma.product.findFirst({
    where: { category },
    orderBy: { createdAt: "desc" },
    select: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
  return product?.images[0]?.url ?? null;
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" } } },
  });
}

export async function getRelatedProducts(category: Category, excludeSlug: string, take = 4) {
  const products = await prisma.product.findMany({
    where: { category, slug: { not: excludeSlug }, sold: false },
    orderBy: { createdAt: "desc" },
    take,
    select: cardSelect,
  });
  return products.map(toCard);
}
