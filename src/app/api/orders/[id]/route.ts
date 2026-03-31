import { NextRequest } from "next/server";
import { orderService } from "@/modules/orders";
import { getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/orders/:id — get order by id or order number
// Supports both authenticated users and guest order lookup
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    // Try by order number first, fallback to ID
    let order;
    try {
      order = await orderService.getOrderByNumber(id);
    } catch {
      order = await orderService.getOrderById(id);
    }

    // Logged-in users can only view their own orders
    // Guest orders (no userId) can be viewed by order number
    if (user && order.userId && order.userId !== user.id) {
      return errorResponse("Order not found", 404);
    }

    // Guest orders require lookup by order number (not raw ID)
    if (!user && order.userId) {
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
