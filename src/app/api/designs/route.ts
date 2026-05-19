import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/http";
import { getCurrentUser } from "@/lib/auth/session";

// GET /api/designs — list current user's saved designs
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const designs = await prisma.savedDesign.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        cartItems: { select: { id: true } },
      },
    });

    // Fetch product info for all designs in one query
    const productIds = Array.from(new Set(designs.map((d) => d.productId)));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        allowCustomPrint: true,
        printPrice: true,
        images: {
          where: { isMain: true },
          select: { url: true },
          take: 1,
        },
      },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return jsonResponse({
      data: designs.map((d) => {
        const p = productMap.get(d.productId);
        return {
          id: d.id,
          productId: d.productId,
          productName: p?.name ?? null,
          productSlug: p?.slug ?? null,
          productImage: p?.images?.[0]?.url ?? null,
          productPrice: p ? Number(p.price) : null,
          printPrice: p?.printPrice ? Number(p.printPrice) : 0,
          name: d.name,
          status: d.status,
          thumbnailUrl: d.thumbnailUrl,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
          inCart: d.cartItems.length > 0,
        };
      }),
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/designs — save a new design draft
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await request.json();
    const { productId, name, designData } = body;

    if (!productId || !designData) {
      return errorResponse("productId and designData are required", 400);
    }

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) return errorResponse("Product not found", 404);

    // Validate designData is valid JSON string
    try {
      JSON.parse(designData);
    } catch {
      return errorResponse("designData must be a valid JSON string", 400);
    }

    const design = await prisma.savedDesign.create({
      data: {
        userId: user.id,
        productId,
        name: name ?? "Untitled Design",
        designData,
        status: "DRAFT",
      },
    });

    return jsonResponse(
      {
        data: {
          id: design.id,
          name: design.name,
          status: design.status,
          createdAt: design.createdAt.toISOString(),
        },
        message: "Design saved successfully",
      },
      201
    );
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
