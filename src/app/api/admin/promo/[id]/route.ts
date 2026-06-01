import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";
import { z } from "zod";

const updatePromoSchema = z.object({
  code: z.string().min(2).max(30).optional(),
  description: z.string().max(255).nullable().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).optional(),
  discountValue: z.number().positive().optional(),
  minOrderAmount: z.number().min(0).nullable().optional(),
  maxDiscount: z.number().min(0).nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  perUserLimit: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

function toPromoDto(promo: {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: { toNumber(): number };
  minOrderAmount: { toNumber(): number } | null;
  maxDiscount: { toNumber(): number } | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  isActive: boolean;
  startsAt: Date;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: promo.id,
    code: promo.code,
    description: promo.description,
    discountType: promo.discountType,
    discountValue: promo.discountValue.toNumber(),
    minOrderAmount: promo.minOrderAmount ? promo.minOrderAmount.toNumber() : null,
    maxDiscount: promo.maxDiscount ? promo.maxDiscount.toNumber() : null,
    usageLimit: promo.usageLimit,
    usageCount: promo.usageCount,
    perUserLimit: promo.perUserLimit,
    isActive: promo.isActive,
    startsAt: promo.startsAt,
    expiresAt: promo.expiresAt,
    createdAt: promo.createdAt,
    updatedAt: promo.updatedAt,
  };
}

// GET /api/admin/promo/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const promo = await prisma.promoCode.findUnique({ where: { id } });
    if (!promo) return errorResponse("Promo code not found", 404);
    return jsonResponse({ data: toPromoDto(promo) });
  } catch (error: unknown) {
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch promo code", 500);
  }
}

// PATCH /api/admin/promo/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updatePromoSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) return errorResponse("Promo code not found", 404);

    const data = parsed.data;

    if (data.code && data.code.toUpperCase() !== existing.code) {
      const conflict = await prisma.promoCode.findUnique({
        where: { code: data.code.toUpperCase() },
      });
      if (conflict) return errorResponse("A promo code with this code already exists", 409);
    }

    const discountType = data.discountType ?? existing.discountType;
    const discountValue = data.discountValue ?? existing.discountValue.toNumber();
    if (discountType === "PERCENTAGE" && discountValue > 100) {
      return errorResponse("Percentage discount cannot exceed 100%", 400);
    }

    const startsAt = data.startsAt ? new Date(data.startsAt) : existing.startsAt;
    const expiresAt =
      data.expiresAt === null
        ? null
        : data.expiresAt
        ? new Date(data.expiresAt)
        : existing.expiresAt;

    if (expiresAt && expiresAt <= startsAt) {
      return errorResponse("Expiry date must be after start date", 400);
    }

    const promo = await prisma.promoCode.update({
      where: { id },
      data: {
        ...(data.code && { code: data.code.toUpperCase() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.discountType && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && { discountValue: data.discountValue }),
        ...(data.minOrderAmount !== undefined && { minOrderAmount: data.minOrderAmount }),
        ...(data.maxDiscount !== undefined && { maxDiscount: data.maxDiscount }),
        ...(data.usageLimit !== undefined && { usageLimit: data.usageLimit }),
        ...(data.perUserLimit !== undefined && { perUserLimit: data.perUserLimit }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.startsAt && { startsAt }),
        ...(data.expiresAt !== undefined && { expiresAt }),
      },
    });

    return jsonResponse({ data: toPromoDto(promo) });
  } catch (error: unknown) {
    return errorResponse(error instanceof Error ? error.message : "Failed to update promo code", 500);
  }
}

// DELETE /api/admin/promo/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) return errorResponse("Promo code not found", 404);

    await prisma.promoCode.delete({ where: { id } });
    return jsonResponse({ message: "Promo code deleted" });
  } catch (error: unknown) {
    return errorResponse(error instanceof Error ? error.message : "Failed to delete promo code", 500);
  }
}
