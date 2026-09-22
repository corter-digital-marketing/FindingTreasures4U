import { z } from "zod";

export const checkoutSchema = z
  .object({
    items: z.array(z.string().min(1)).min(1, "Your cart is empty."),
    customerName: z.string().trim().min(2, "Please enter your full name."),
    email: z.string().trim().email("Please enter a valid email address."),
    phone: z.string().trim().optional(),
    deliveryMethod: z.enum(["SHIPPING", "PICKUP"], {
      message: "Please choose shipping or in-store pickup.",
    }),
    // Only required when shipping — checked in superRefine below.
    addressLine1: z.string().trim().optional(),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().optional(),
    region: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    country: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod !== "SHIPPING") return;
    const required: [keyof typeof data, string, number][] = [
      ["addressLine1", "Please enter your street address.", 3],
      ["city", "Please enter your city.", 1],
      ["region", "Please enter your state or region.", 1],
      ["postalCode", "Please enter your postal code.", 1],
      ["country", "Please enter your country.", 1],
    ];
    for (const [field, message, min] of required) {
      const value = data[field];
      if (typeof value !== "string" || value.length < min) {
        ctx.addIssue({ code: "custom", path: [field], message });
      }
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  name: z.string().trim().min(2, "Please enter a name for this piece."),
  category: z.enum(["FURNISHINGS", "WEATHERVANES", "COLLECTABLES", "ARTWORKS", "JEWELRY", "CURRENCY"], {
    message: "Please choose a category.",
  }),
  priceDollars: z.coerce.number().positive("Please enter a price greater than 0."),
  shippingTier: z.enum(["SMALL", "MEDIUM", "LARGE", "CONTACT"], {
    message: "Please choose a shipping size.",
  }),
  description: z.string().trim().min(10, "Please add a short description."),
  condition: z.string().trim().optional(),
  dimensions: z.string().trim().optional(),
  sold: z.coerce.boolean().optional(),
  published: z.coerce.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
