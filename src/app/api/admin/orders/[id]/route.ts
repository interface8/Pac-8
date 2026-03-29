import { NextRequest } from "next/server";
import { orderService, updateOrderSchema } from "@/modules/orders";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/admin/orders/:id — get any order by id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const order = await orderService.getOrderById(id);
    return jsonResponse({ data: order });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Order not found") {
      return errorResponse("Order not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}

// PATCH /api/admin/orders/:id — update order (status, tracking, notes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateOrderSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    const order = await orderService.updateOrder(id, parsed.data);
    return jsonResponse({ data: order });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Order not found") {
      return errorResponse("Order not found", 404);
    }
    if (error instanceof Error && error.message.includes("Cannot transition")) {
      return errorResponse(error.message, 400);
    }
    const message = error instanceof Error ? error.message : "Failed to update order";
    return errorResponse(message, 500);
  }
}
