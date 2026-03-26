import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "pac8_token";
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];
const PROTECTED_ROUTE_PREFIX = "/dashboard";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-page requests (static files, api, _next)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // ─── Validate token ──────────────────────────────────
  let isAuthenticated = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecret());
      isAuthenticated = !!payload.sub;

      // Attach user info to headers for downstream use
      const response = NextResponse.next();
      response.headers.set("x-user-id", payload.sub as string);
      response.headers.set("x-user-email", (payload.email as string) ?? "");

      // If authenticated user tries to access public routes, redirect to dashboard
      if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      return response;
    } catch {
      // Invalid token — treat as unauthenticated
      isAuthenticated = false;
    }
  }

  // ─── Protect dashboard routes ─────────────────────────
  if (!isAuthenticated && pathname.startsWith(PROTECTED_ROUTE_PREFIX)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
