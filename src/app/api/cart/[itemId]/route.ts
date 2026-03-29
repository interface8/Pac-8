import { NextRequest } from "next/server";
import { cartService, updateCartItemSchema } from "@/modules/carts";
import { jsonResponse, errorResponse } from "@/lib/http";

// PATCH /api/cart/:itemId — update cart item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const parsed = updateCartItemSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    const cart = await cartService.updateCartItem(itemId, parsed.data);
    return jsonResponse({ data: cart });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "Cart item not found") return errorResponse("Cart item not found", 404);
      if (error.message.includes("stock")) return errorResponse(error.message, 400);
    }
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/cart/:itemId — remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const cart = await cartService.removeCartItem(itemId);
    return jsonResponse({ data: cart });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Cart item not found") {
      return errorResponse("Cart item not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}
