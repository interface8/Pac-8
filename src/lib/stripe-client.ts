"use client";

import { loadStripe } from "@stripe/stripe-js";

// Client-side Stripe promise (loaded once, reused)
export const getStripe = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  }
  return loadStripe(key);
};
