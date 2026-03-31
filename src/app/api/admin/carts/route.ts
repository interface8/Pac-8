import { cartService } from "@/modules/carts";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/admin/carts — list all carts (analytics/management)
export async function GET() {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const carts = await cartService.listAllCarts();
    return jsonResponse({ data: carts });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch carts";
    return errorResponse(message, 500);
  }
}
