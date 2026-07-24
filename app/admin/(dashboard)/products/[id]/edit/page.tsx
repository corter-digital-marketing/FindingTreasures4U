import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct, deleteProduct } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });

  if (!product) notFound();

  return (
    <div className="p-6 md:p-10">
      <p className="text-[11px] tracking-[0.2em] uppercase text-bronze-dark mb-2">Products</p>
      <h1 className="font-serif-display text-3xl text-charcoal mb-10">{product.name}</h1>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        onDelete={deleteProduct.bind(null, product.id)}
        submitLabel="Save Changes"
        initial={{
          id: product.id,
          name: product.name,
          category: product.category,
          priceCents: product.priceCents,
          description: product.description,
          condition: product.condition,
          dimensions: product.dimensions,
          sold: product.sold,
          images: product.images,
        }}
      />
    </div>
  );
}
