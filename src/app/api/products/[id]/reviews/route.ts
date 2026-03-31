import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/products/[id]/reviews — fetch reviews for a product (by slug or id)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Resolve product by slug or id
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: id }, { id }],
      },
      select: { id: true },
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    const reviews = await prisma.review.findMany({
      where: { productId: product.id, isVisible: true },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return jsonResponse({
      data: {
        reviews: reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          userName: r.user.name ?? "Anonymous",
          createdAt: r.createdAt.toISOString(),
        })),
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
      },
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
