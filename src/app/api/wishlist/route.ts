import { NextRequest } from "next/server";
import { wishlistService, addToWishlistSchema } from "@/modules/wishlists";
import { getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/wishlist — get current user's wishlist
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = request.headers.get("x-session-id") ?? undefined;

    if (!user && !sessionId) {
      return errorResponse("Session ID or authentication required", 400);
    }

    const items = await wishlistService.getWishlist(user?.id, sessionId);
    return jsonResponse({ data: items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch wishlist";
    return errorResponse(message, 500);
  }
}

// POST /api/wishlist — add to wishlist
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = request.headers.get("x-session-id") ?? undefined;

    if (!user && !sessionId) {
      return errorResponse("Session ID or authentication required", 400);
    }

    const body = await request.json();
    const parsed = addToWishlistSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    const item = await wishlistService.addToWishlist({
      ...parsed.data,
      userId: user?.id,
      sessionId,
    });

    return jsonResponse(item, 201);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Product already in wishlist") {
      return errorResponse(error.message, 409);
    }
    const message = error instanceof Error ? error.message : "Failed to add to wishlist";
    return errorResponse(message, 500);
  }
}
