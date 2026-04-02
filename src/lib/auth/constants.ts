// ─── Auth constants ─────────────────────────────────────
export const AUTH_COOKIE_NAME = "pac8_token";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];
export const ADMIN_ROUTE_PREFIX = "/dashboard";
export const AUTH_ROUTE_PREFIX = "/account";
