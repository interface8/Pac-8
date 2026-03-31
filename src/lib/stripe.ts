import Stripe from "stripe";
import { env } from "@/lib/env";

// Server-side Stripe instance
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});
