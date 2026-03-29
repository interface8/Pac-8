import { NextRequest } from "next/server";
import { cartService, mergeCartSchema } from "@/modules/carts";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// POST /api/cart/merge — merge guest cart with user cart on login
export async function POST(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = mergeCartSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    const cart = await cartService.mergeGuestCart({
      userId: guard.id,
      sessionId: parsed.data.sessionId,
    });

    return jsonResponse({ data: cart });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to merge cart";
    return errorResponse(message, 500);
  }
}
