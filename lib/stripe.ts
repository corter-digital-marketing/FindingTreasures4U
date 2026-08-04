import Stripe from "stripe";

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined;
};

function createClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set. Add it to your .env file.");
  }
  return new Stripe(key);
}

export const stripe = globalForStripe.stripe ?? createClient();

if (process.env.NODE_ENV !== "production") globalForStripe.stripe = stripe;
