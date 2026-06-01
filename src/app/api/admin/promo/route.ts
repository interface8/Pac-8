import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";
import { z } from "zod";

const createPromoSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters").max(30, "Code too long"),
  description: z.string().max(255).optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().positive("Discount value must be positive"),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().min(0).default(1),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

// GET /api/admin/promo — list all promo codes
export async function GET(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const activeOnly = searchParams.get("active") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const where = {
      ...(activeOnly && { isActive: true }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [codes, total] = await Promise.all([
      prisma.promoCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { orders: true } } },
      }),
      prisma.promoCode.count({ where }),
    ]);

    const data = codes.map((c) => ({
      id: c.id,
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue.toNumber(),
      minOrderAmount: c.minOrderAmount ? c.minOrderAmount.toNumber() : null,
      maxDiscount: c.maxDiscount ? c.maxDiscount.toNumber() : null,
      usageLimit: c.usageLimit,
      usageCount: c.usageCount,
      perUserLimit: c.perUserLimit,
      isActive: c.isActive,
      startsAt: c.startsAt,
      expiresAt: c.expiresAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      orderCount: c._count.orders,
    }));

    return jsonResponse({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch promo codes";
    return errorResponse(message, 500);
  }
}

// POST /api/admin/promo — create a new promo code
export async function POST(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = createPromoSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      perUserLimit,
      isActive,
      startsAt,
      expiresAt,
    } = parsed.data;

    const existing = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (existing) {
      return errorResponse("A promo code with this code already exists", 409);
    }

    if (expiresAt && startsAt && new Date(expiresAt) <= new Date(startsAt)) {
      return errorResponse("Expiry date must be after start date", 400);
    }
    if (discountType === "PERCENTAGE" && discountValue > 100) {
      return errorResponse("Percentage discount cannot exceed 100%", 400);
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        description: description ?? null,
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount ?? null,
        maxDiscount: maxDiscount ?? null,
        usageLimit: usageLimit ?? null,
        perUserLimit,
        isActive,
        startsAt: startsAt ? new Date(startsAt) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return jsonResponse({
      data: {
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
        orderCount: 0,
      },
    }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create promo code";
    return errorResponse(message, 500);
  }
}
