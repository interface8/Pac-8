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

    return jsonResponse({
      data: designs.map((d) => ({
        id: d.id,
        productId: d.productId,
        name: d.name,
        status: d.status,
        thumbnailUrl: d.thumbnailUrl,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
        inCart: d.cartItems.length > 0,
      })),
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
