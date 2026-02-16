// ─── Auth constants ─────────────────────────────────────
export const AUTH_COOKIE_NAME = "power8_token";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];
export const PROTECTED_ROUTE_PREFIX = "/dashboard";
