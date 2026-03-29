import { NextRequest } from "next/server";
import { wishlistService } from "@/modules/wishlists";
import { jsonResponse, errorResponse } from "@/lib/http";

// DELETE /api/wishlist/:id — remove from wishlist
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await wishlistService.removeFromWishlist(id);
    return jsonResponse({ message: "Removed from wishlist" });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
