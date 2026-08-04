"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";
import { generateUniqueSlug } from "@/lib/slug";
import { deleteUploadedImages } from "@/lib/uploads";
import { safeRevalidatePath } from "@/lib/revalidate";

type ActionState = { error: string } | { redirectTo: string } | null;

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    priceDollars: formData.get("priceDollars"),
    description: formData.get("description"),
    condition: formData.get("condition"),
    dimensions: formData.get("dimensions"),
    sold: formData.get("sold") === "on",
  });
}

// Photos are uploaded directly from the browser to Blob storage before this
// action ever runs (see components/admin/product-form.tsx), so all this
// receives is the resulting URLs — never raw file bytes. That keeps every
// submission tiny regardless of how many or how large the photos are,
// well clear of Vercel's 4.5MB request body limit on serverless functions.
function getImageUrls(formData: FormData): string[] {
  return formData
    .getAll("imageUrls")
    .filter((v): v is string => typeof v === "string" && v.length > 0);
}

export async function createProduct(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const imageUrls = getImageUrls(formData);
  const slug = await generateUniqueSlug(parsed.data.name);

  const product = await prisma.product.create({
    data: {
      slug,
      name: parsed.data.name,
      category: parsed.data.category,
      priceCents: Math.round(parsed.data.priceDollars * 100),
      description: parsed.data.description,
      condition: parsed.data.condition || null,
      dimensions: parsed.data.dimensions || null,
      sold: !!parsed.data.sold,
      images: {
        create: imageUrls.map((url, i) => ({ url, position: i })),
      },
    },
  });

  safeRevalidatePath("/", "layout");
  return { redirectTo: `/admin/products/${product.id}/edit?created=1` };
}

export async function updateProduct(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!existing) return { error: "This product could not be found." };

  const removeIds = new Set(formData.getAll("removeImages").map(String));
  const keptImages = existing.images.filter((img) => !removeIds.has(img.id));
  const newImageUrls = getImageUrls(formData);

  const slug =
    parsed.data.name === existing.name
      ? existing.slug
      : await generateUniqueSlug(parsed.data.name, existing.id);

  const removedImages = existing.images.filter((img) => removeIds.has(img.id));

  await prisma.$transaction(async (tx) => {
    if (removeIds.size > 0) {
      await tx.productImage.deleteMany({ where: { id: { in: [...removeIds] } } });
    }
    await tx.product.update({
      where: { id },
      data: {
        slug,
        name: parsed.data.name,
        category: parsed.data.category,
        priceCents: Math.round(parsed.data.priceDollars * 100),
        description: parsed.data.description,
        condition: parsed.data.condition || null,
        dimensions: parsed.data.dimensions || null,
        sold: !!parsed.data.sold,
      },
    });
    for (let i = 0; i < keptImages.length; i++) {
      await tx.productImage.update({ where: { id: keptImages[i].id }, data: { position: i } });
    }
    if (newImageUrls.length > 0) {
      await tx.productImage.createMany({
        data: newImageUrls.map((url, i) => ({
          productId: id,
          url,
          position: keptImages.length + i,
        })),
      });
    }
  });

  if (removedImages.length > 0) {
    await deleteUploadedImages(removedImages.map((img) => img.url));
  }

  safeRevalidatePath("/", "layout");
  return { redirectTo: `/admin/products/${id}/edit?saved=1` };
}

export async function deleteProduct(id: string): Promise<void> {
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  await prisma.product.delete({ where: { id } });
  if (existing && existing.images.length > 0) {
    await deleteUploadedImages(existing.images.map((img) => img.url));
  }
  safeRevalidatePath("/", "layout");
  redirect("/admin/products");
}
