import { NextRequest } from "next/server";
import { wishlistService, mergeWishlistSchema } from "@/modules/wishlists";
import { requireApiAuth, isErrorResponse, getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// POST /api/wishlist/merge — merge guest wishlist to user on login
export async function POST(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await request.json();
    const parsed = mergeWishlistSchema.safeParse({ ...body, userId: user.id });

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    await wishlistService.mergeGuestWishlist(parsed.data);
    return jsonResponse({ message: "Wishlist merged successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to merge wishlist";
    return errorResponse(message, 500);
  }
}
