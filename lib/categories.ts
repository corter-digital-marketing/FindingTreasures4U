import type { Category } from "@/app/generated/prisma";

export const CATEGORIES: { value: Category; slug: string; label: string; singular: string }[] = [
  { value: "FURNISHINGS", slug: "furnishings", label: "Furnishings", singular: "Furnishing" },
  { value: "WEATHERVANES", slug: "weathervanes", label: "Weathervanes", singular: "Weathervane" },
  { value: "COLLECTABLES", slug: "collectables", label: "Collectables", singular: "Collectable" },
  { value: "ARTWORKS", slug: "artworks", label: "Artworks", singular: "Artwork" },
];

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryLabel(value: Category): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
