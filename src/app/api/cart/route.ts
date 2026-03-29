import { NextRequest } from "next/server";
import { cartService, addToCartSchema } from "@/modules/carts";
import { getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/cart — get cart (works for both logged-in and guest users)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    // Need either userId or sessionId
    if (!user && !sessionId) {
      return errorResponse("Session ID required for guest users", 400);
    }

    const cart = await cartService.getCart(user?.id, sessionId || undefined);
    return jsonResponse({ data: cart });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch cart";
    return errorResponse(message, 500);
  }
}

// POST /api/cart — add item to cart (works for both logged-in and guest users)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const parsed = addToCartSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    // Add userId or sessionId
    const input = {
      ...parsed.data,
      userId: user?.id,
      sessionId: parsed.data.sessionId || undefined,
    };

    // Validate we have either userId or sessionId
    if (!input.userId && !input.sessionId) {
      return errorResponse("Session ID required for guest users", 400);
    }

    const cart = await cartService.addToCart(input);
    return jsonResponse({ data: cart }, 201);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "Product not found") return errorResponse("Product not found", 404);
      if (error.message.includes("out of stock") || error.message.includes("not available")) {
        return errorResponse(error.message, 400);
      }
      if (error.message.includes("Only") || error.message.includes("Print text")) {
        return errorResponse(error.message, 400);
      }
    }
    return errorResponse("Internal server error", 500);
  }
}
