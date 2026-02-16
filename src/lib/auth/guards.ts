import { redirect } from "next/navigation";
import { getCurrentUser, type SessionUser } from "./session";
import { hasPermission } from "./permissions";
import { errorResponse } from "@/lib/http";

// ─── Server Component / Server Action guard ────────────

/**
 * Use inside Server Components or Server Actions.
 * Redirects to /login if not authenticated, or /dashboard if missing permission.
 */
export async function requirePermission(
  permission: string,
): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasPermission(user, permission)) {
    redirect("/dashboard?error=forbidden");
  }

  return user;
}

/**
 * Guard that only checks authentication (no permission check).
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

// ─── API Route guard ───────────────────────────────────

/**
 * Use inside API route handlers.
 * Returns the user or a 401/403 Response.
 */
export async function requireApiPermission(
  permission: string,
): Promise<SessionUser | Response> {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  if (!hasPermission(user, permission)) {
    return errorResponse("Forbidden", 403);
  }

  return user;
}

/**
 * API route guard that only checks authentication.
 */
export async function requireApiAuth(): Promise<SessionUser | Response> {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  return user;
}

/**
 * Type guard to check if the guard result is an error response.
 */
export function isErrorResponse(
  result: SessionUser | Response,
): result is Response {
  return result instanceof Response;
}
