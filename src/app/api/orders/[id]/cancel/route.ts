import { NextRequest } from "next/server";
import { orderService } from "@/modules/orders";
import { requireApiAuth, isErrorResponse, getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// POST /api/orders/:id/cancel — cancel an order (customer)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    const order = await orderService.getOrderById(id);

    if (order.userId !== user.id) {
      return errorResponse("Order not found", 404);
    }

    const updated = await orderService.cancelOrder(id);
    return jsonResponse({ data: updated });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Order not found") {
      return errorResponse("Order not found", 404);
    }
    if (error instanceof Error && error.message.includes("Cannot transition")) {
      return errorResponse(error.message, 400);
    }
    return errorResponse("Internal server error", 500);
  }
}
