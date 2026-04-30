import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

const VALID_VIEW_KEYS = ["front", "back", "left", "right", "top", "bottom"] as const;
type ViewKey = (typeof VALID_VIEW_KEYS)[number];

// GET /api/admin/products/[id]/views
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!product) return errorResponse("Product not found", 404);

    const views = await prisma.productView.findMany({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
    });

    return jsonResponse({ data: views });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/admin/products/[id]/views — add a new customizable view
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!product) return errorResponse("Product not found", 404);

    const body = await request.json();
    const { viewKey, name, baseImageUrl, description, sortOrder, isDefault } = body;

    if (!viewKey || !name || !baseImageUrl) {
      return errorResponse("viewKey, name, and baseImageUrl are required", 400);
    }

    if (!VALID_VIEW_KEYS.includes(viewKey as ViewKey)) {
      return errorResponse(
        `viewKey must be one of: ${VALID_VIEW_KEYS.join(", ")}`,
        400
      );
    }

    // If setting this as default, clear existing default first
    if (isDefault) {
      await prisma.productView.updateMany({
        where: { productId: id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const view = await prisma.productView.create({
      data: {
        productId: id,
        viewKey,
        name,
        baseImageUrl,
        description: description ?? null,
        sortOrder: sortOrder ?? 0,
        isDefault: isDefault ?? false,
      },
    });

    return jsonResponse({ data: view }, 201);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return errorResponse("A view with that viewKey already exists for this product", 409);
    }
    return errorResponse("Internal server error", 500);
  }
}
