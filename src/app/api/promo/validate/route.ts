import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";
import { z } from "zod";

const validatePromoSchema = z.object({
  code: z.string().min(1, "Promo code is required"),
  subtotal: z.number().min(0),
});

// POST /api/promo/validate — validate and calculate discount
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validatePromoSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    const { code, subtotal } = parsed.data;

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return errorResponse("Invalid promo code", 404);
    }

    if (!promo.isActive) {
      return errorResponse("This promo code is no longer active", 400);
    }

    const now = new Date();
    if (promo.startsAt > now) {
      return errorResponse("This promo code is not yet valid", 400);
    }
    if (promo.expiresAt && promo.expiresAt < now) {
      return errorResponse("This promo code has expired", 400);
    }

    if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
      return errorResponse("This promo code has reached its usage limit", 400);
    }

    // Check per-user limit for logged-in users
    const user = await getCurrentUser();
    if (user && promo.perUserLimit > 0) {
      const userUsage = await prisma.order.count({
        where: { userId: user.id, promoCodeId: promo.id },
      });
      if (userUsage >= promo.perUserLimit) {
        return errorResponse("You have already used this promo code", 400);
      }
    }

    // Check minimum order amount
    const minOrder = promo.minOrderAmount ? promo.minOrderAmount.toNumber() : 0;
    if (subtotal < minOrder) {
      return errorResponse(
        `Minimum order amount of ₦${minOrder.toLocaleString()} required`,
        400,
      );
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === "PERCENTAGE") {
      discount = subtotal * (promo.discountValue.toNumber() / 100);
    } else {
      discount = promo.discountValue.toNumber();
    }

    // Cap discount
    const maxDiscount = promo.maxDiscount ? promo.maxDiscount.toNumber() : Infinity;
    discount = Math.min(discount, maxDiscount, subtotal);

    return jsonResponse({
      data: {
        id: promo.id,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue.toNumber(),
        discount: Math.round(discount * 100) / 100,
        description: promo.description,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to validate promo code";
    return errorResponse(message, 500);
  }
}
