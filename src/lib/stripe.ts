import Stripe from "stripe";
import { env } from "@/lib/env";

// Server-side Stripe instance
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-03-31.basil",
  typescript: true,
});
