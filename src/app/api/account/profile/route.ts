import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiAuth, isErrorResponse, getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .refine((v) => /^\+?[0-9]{7,15}$/.test(v), "Phone must be 7-15 digits");

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  phone: phoneSchema.optional(),
});

// GET /api/account/profile — get own profile
export async function GET() {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  const user = await getCurrentUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!profile) return errorResponse("User not found", 404);

  return jsonResponse({ data: profile });
}

// PATCH /api/account/profile — update own profile (name, phone)
export async function PATCH(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  const user = await getCurrentUser();
  if (!user) return errorResponse("Unauthorized", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
    return errorResponse(firstError, 400);
  }

  const { name, phone } = parsed.data;

  // Check phone uniqueness if changing
  if (phone) {
    const existing = await prisma.user.findFirst({
      where: { phone, id: { not: user.id } },
    });
    if (existing) return errorResponse("Phone number already in use", 409);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return jsonResponse({ data: updated });
}
