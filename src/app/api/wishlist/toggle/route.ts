import { NextRequest } from "next/server";
import { wishlistService, addToWishlistSchema } from "@/modules/wishlists";
import { getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// POST /api/wishlist/toggle — toggle product in wishlist
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

    const result = await wishlistService.toggleWishlist({
      ...parsed.data,
      userId: user?.id,
      sessionId,
    });

    return jsonResponse(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to toggle wishlist";
    return errorResponse(message, 500);
  }
}
