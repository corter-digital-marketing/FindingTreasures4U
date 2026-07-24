import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <div className="p-6 md:p-10">
      <p className="text-[11px] tracking-[0.2em] uppercase text-bronze-dark mb-2">Products</p>
      <h1 className="font-serif-display text-3xl text-charcoal mb-10">Add a New Piece</h1>
      <ProductForm action={createProduct} submitLabel="Publish Piece" />
    </div>
  );
}
