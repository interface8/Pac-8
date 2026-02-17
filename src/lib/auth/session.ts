import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "./constants";

// ─── Types ──────────────────────────────────────────────
export interface JwtPayload {
  sub: string; // userId
  email: string;
  iat?: number;
  exp?: number;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  permissions: string[]; // e.g. ["users.read", "users.create"]
  roles: string[];       // role names
}

// ─── Helpers ────────────────────────────────────────────
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

// ─── Sign JWT ───────────────────────────────────────────
export async function signJwt(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
  const secret = getSecret();

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

// ─── Verify JWT ─────────────────────────────────────────
export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

// ─── Set auth cookie ────────────────────────────────────
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
}

// ─── Remove auth cookie ────────────────────────────────
export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

// ─── Get token from cookies ────────────────────────────
export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

// ─── Get current authenticated user ─────────────────────
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getToken();
  if (!token) return null;

  const payload = await verifyJwt(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) return null;

  interface UserRole {
    role: {
      name: string;
      permissions: Array<{ permission: { resource: string; action: string } }>;
    };
  }
  
  const roles = user.roles.map((ur: UserRole) => ur.role.name);
  const permissionsSet = new Set<string>(
    user.roles.flatMap((ur: UserRole) =>
      ur.role.permissions.map(
        (rp) => `${rp.permission.resource}.${rp.permission.action}`,
      ),
    ),
  );
  const permissions = Array.from(permissionsSet);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isActive: user.isActive,
    permissions,
    roles,
  };
}
