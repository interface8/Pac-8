// ─── Environment helpers ───────────────────────────────
function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export const env = {
  DATABASE_URL: getEnv("DATABASE_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "1d"),
  APP_URL: getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  NODE_ENV: getEnv("NODE_ENV", "development"),

  // Stripe
  STRIPE_SECRET_KEY: getEnv("STRIPE_SECRET_KEY", ""),
  STRIPE_WEBHOOK_SECRET: getEnv("STRIPE_WEBHOOK_SECRET", ""),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: getEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", ""),

  // A1 Pay
  A1PAY_MERCHANT_ID: getOptionalEnv("A1PAY_MERCHANT_ID"),
  A1PAY_PUBLIC_KEY: getOptionalEnv("A1PAY_PUBLIC_KEY"),
  A1PAY_SECRET_KEY: getOptionalEnv("A1PAY_SECRET_KEY"),
  A1PAY_INITIALIZE_URL: getOptionalEnv("A1PAY_INITIALIZE_URL"),
  A1PAY_QUERY_URL: getOptionalEnv("A1PAY_QUERY_URL"),
  A1PAY_WEBHOOK_SECRET: getOptionalEnv("A1PAY_WEBHOOK_SECRET"),
  A1PAY_SIGNATURE_HEADER: getOptionalEnv("A1PAY_SIGNATURE_HEADER"),
  A1PAY_SIGNATURE_TIMESTAMP_HEADER: getOptionalEnv("A1PAY_SIGNATURE_TIMESTAMP_HEADER"),
} as const;
