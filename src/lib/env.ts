// ─── Environment helpers ───────────────────────────────
function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  DATABASE_URL: getEnv("DATABASE_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "7d"),
  APP_URL: getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
} as const;
