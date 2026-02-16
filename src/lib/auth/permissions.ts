import type { SessionUser } from "./session";

// ─── Permission checking ──────────────────────────────

/**
 * Check if a user has a specific permission.
 * Permission format: "resource.action" e.g. "users.read"
 */
export function hasPermission(
  user: SessionUser | null,
  permission: string,
): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

/**
 * Check if a user has ALL of the specified permissions.
 */
export function hasAllPermissions(
  user: SessionUser | null,
  permissions: string[],
): boolean {
  if (!user) return false;
  return permissions.every((p) => user.permissions.includes(p));
}

/**
 * Check if a user has ANY of the specified permissions.
 */
export function hasAnyPermission(
  user: SessionUser | null,
  permissions: string[],
): boolean {
  if (!user) return false;
  return permissions.some((p) => user.permissions.includes(p));
}

/**
 * Check if a user has a specific role.
 */
export function hasRole(user: SessionUser | null, role: string): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}
