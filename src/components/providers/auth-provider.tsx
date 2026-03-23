// "use client";

// import { createContext, useContext, type ReactNode } from "react";
// import type { SessionUser } from "@/lib/auth/session";

// const AuthContext = createContext<SessionUser | null>(null);

// export function AuthProvider({
//   user,
//   children,
// }: {
//   user: SessionUser | null;
//   children: ReactNode;
// }) {
//   return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }

// /**
//  * Client-side permission check hook.
//  * Usage: const canRead = usePermission("users.read");
//  */
// export function usePermission(permission: string): boolean {
//   const user = useContext(AuthContext);
//   if (!user) return false;
//   return user.permissions.includes(permission);
// }

// /**
//  * Client-side role check hook.
//  */
// export function useRole(role: string): boolean {
//   const user = useContext(AuthContext);
//   if (!user) return false;
//   return user.roles.includes(role);
// }


"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SessionUser } from "@/lib/auth/session";

const AuthContext = createContext<SessionUser | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user?: SessionUser | null;
  children: ReactNode;
}) {
  return <AuthContext.Provider value={user ?? null}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Client-side permission check hook.
 * Usage: const canRead = usePermission("users.read");
 */
export function usePermission(permission: string): boolean {
  const user = useContext(AuthContext);
  if (!user) return false;
  return user.permissions.includes(permission);
}

/**
 * Client-side role check hook.
 */
export function useRole(role: string): boolean {
  const user = useContext(AuthContext);
  if (!user) return false;
  return user.roles.includes(role);
}


