import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/http";
import { getCurrentUser } from "@/lib/auth";

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

// POST /api/products/[id]/reviews — create a review for a product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

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

    const body = await request.json();
    const { rating, title, comment } = body;

    // Validate rating
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return errorResponse("Rating must be between 1 and 5", 400);
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: product.id,
          userId: user.id,
        },
      },
    });

    if (existingReview) {
      return errorResponse("You have already reviewed this product", 409);
    }

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: user.id,
        rating: Math.round(rating),
        title: title?.trim() || null,
        comment: comment?.trim() || null,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    return jsonResponse(
      {
        data: {
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          userName: review.user.name ?? "Anonymous",
          createdAt: review.createdAt.toISOString(),
        },
      },
      201
    );
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
