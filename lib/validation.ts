import { z } from "zod";

export const checkoutSchema = z.object({
  items: z.array(z.string().min(1)).min(1, "Your cart is empty."),
  customerName: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().optional(),
  addressLine1: z.string().trim().min(3, "Please enter your street address."),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(1, "Please enter your city."),
  region: z.string().trim().min(1, "Please enter your state or region."),
  postalCode: z.string().trim().min(1, "Please enter your postal code."),
  country: z.string().trim().min(1, "Please enter your country."),
  notes: z.string().trim().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  name: z.string().trim().min(2, "Please enter a name for this piece."),
  category: z.enum(["FURNISHINGS", "WEATHERVANES", "COLLECTABLES", "ARTWORKS"], {
    message: "Please choose a category.",
  }),
  priceDollars: z.coerce.number().positive("Please enter a price greater than 0."),
  description: z.string().trim().min(10, "Please add a short description."),
  condition: z.string().trim().optional(),
  dimensions: z.string().trim().optional(),
  sold: z.coerce.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
