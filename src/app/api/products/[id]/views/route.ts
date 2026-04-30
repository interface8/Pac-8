import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/products/[id]/views — public endpoint to list a product's customizable views
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Accept both id and slug
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }], isActive: true },
      select: { id: true },
    });

    if (!product) return errorResponse("Product not found", 404);

    const views = await prisma.productView.findMany({
      where: { productId: product.id },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        viewKey: true,
        name: true,
        baseImageUrl: true,
        description: true,
        sortOrder: true,
        isDefault: true,
      },
    });

    return jsonResponse({ data: views });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
