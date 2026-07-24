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
