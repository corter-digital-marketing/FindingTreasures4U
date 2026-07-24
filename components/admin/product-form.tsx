"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Field, TextAreaField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";
import type { Category } from "@/app/generated/prisma";

type ActionState = { error: string } | null;

export type ProductFormInitial = {
  id?: string;
  name: string;
  category: Category;
  priceCents: number;
  description: string;
  condition: string | null;
  dimensions: string | null;
  sold: boolean;
  images: { id: string; url: string }[];
};

export function ProductForm({
  action,
  initial,
  submitLabel,
  onDelete,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: ProductFormInitial;
  submitLabel: string;
  onDelete?: () => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const toggleRemove = (id: string) => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <form action={formAction} className="max-w-2xl space-y-10">
      <fieldset className="space-y-6">
        <legend className="font-serif-display text-xl text-charcoal mb-1">Details</legend>
        <Field label="Name" name="name" required defaultValue={initial?.name} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-[11px] tracking-[0.1em] uppercase text-charcoal-soft">
              Category <span className="text-oxblood">*</span>
            </span>
            <select
              name="category"
              required
              defaultValue={initial?.category ?? ""}
              className="mt-2 w-full border-0 border-b border-line bg-transparent py-2 text-[15px] text-charcoal outline-none transition-colors focus:border-bronze-dark"
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <Field
            label="Price (USD)"
            name="priceDollars"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={initial ? (initial.priceCents / 100).toFixed(2) : undefined}
          />
        </div>

        <TextAreaField
          label="Description"
          name="description"
          required
          rows={5}
          defaultValue={initial?.description}
        />
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="font-serif-display text-xl text-charcoal mb-1">Condition</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Dimensions" name="dimensions" defaultValue={initial?.dimensions ?? ""} />
          <Field label="Condition" name="condition" defaultValue={initial?.condition ?? ""} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-serif-display text-xl text-charcoal mb-1">Photos</legend>

        {initial && initial.images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {initial.images.map((img) => {
              const marked = removedIds.has(img.id);
              return (
                <div key={img.id} className="relative">
                  <div className={`relative aspect-square bg-ivory-dim ${marked ? "opacity-30" : ""}`}>
                    <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
                  </div>
                  <label className="mt-1.5 flex items-center gap-1.5 text-[11px] text-charcoal-soft">
                    <input
                      type="checkbox"
                      name="removeImages"
                      value={img.id}
                      checked={marked}
                      onChange={() => toggleRemove(img.id)}
                      className="accent-oxblood"
                    />
                    Remove
                  </label>
                </div>
              );
            })}
          </div>
        )}

        <label className="block">
          <span className="text-[11px] tracking-[0.1em] uppercase text-charcoal-soft">
            {initial ? "Add More Photos" : "Photos"}
          </span>
          <input
            type="file"
            name="images"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="mt-2 block w-full text-[13px] text-charcoal-soft file:mr-4 file:border file:border-line file:bg-transparent file:px-4 file:py-2 file:text-[12px] file:uppercase file:tracking-[0.08em] file:text-charcoal hover:file:border-bronze-dark"
          />
        </label>
      </fieldset>

      <fieldset className="flex flex-wrap gap-8">
        <label className="flex items-center gap-2 text-[13px] text-charcoal">
          <input
            type="checkbox"
            name="sold"
            defaultChecked={initial?.sold}
            className="accent-oxblood w-4 h-4"
          />
          Mark as Sold
        </label>
      </fieldset>

      {state?.error && (
        <p className="text-[13px] text-oxblood" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : submitLabel}
          </Button>
          <Link href="/admin/products" className="link-underline text-[13px] text-charcoal-soft">
            Cancel
          </Link>
        </div>
        {onDelete && (
          <form action={onDelete}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-[13px] text-oxblood hover:text-oxblood-dark transition-colors"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              Delete
            </button>
          </form>
        )}
      </div>
    </form>
  );
}
