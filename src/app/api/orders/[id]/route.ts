import { NextRequest } from "next/server";
import { orderService } from "@/modules/orders";
import { requireApiAuth, isErrorResponse, getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/orders/:id — get order by id or order number
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { id } = await params;

    // Try by order number first, fallback to ID
    let order;
    try {
      order = await orderService.getOrderByNumber(id);
    } catch {
      order = await orderService.getOrderById(id);
    }

    // Users can only view their own orders
    if (order.userId !== user.id) {
      return errorResponse("Order not found", 404);
    }

    return jsonResponse({ data: order });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Order not found") {
      return errorResponse("Order not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}
