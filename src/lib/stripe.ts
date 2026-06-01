import Stripe from "stripe";

// Validate that the key looks like a real Stripe secret key
function isValidStripeKey(key: string | undefined): key is string {
  return !!(key && (key.startsWith("sk_test_") || key.startsWith("sk_live_")));
}

const key = process.env.STRIPE_SECRET_KEY;

/** Whether Stripe is properly configured with a valid secret key */
export const isStripeConfigured = isValidStripeKey(key);

/** Server-side Stripe instance — null when not configured */
export const stripe: Stripe | null = isStripeConfigured
  ? new Stripe(key!, { apiVersion: "2026-03-25.dahlia", typescript: true })
  : null;
