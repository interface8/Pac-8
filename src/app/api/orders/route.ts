import { NextRequest } from "next/server";
import { orderService, createOrderSchema } from "@/modules/orders";
import { requireApiAuth, isErrorResponse, getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/orders — list current user's orders
export async function GET() {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const orders = await orderService.getOrdersByUserId(user.id);
    return jsonResponse({ data: orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    return errorResponse(message, 500);
  }
}

// POST /api/orders — create order
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    const order = await orderService.createOrder({
      ...parsed.data,
      userId: user?.id,
    });

    return jsonResponse(order, 201);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("not available")) {
      return errorResponse(error.message, 400);
    }
    if (error instanceof Error && error.message.includes("Insufficient stock")) {
      return errorResponse(error.message, 400);
    }
    const message = error instanceof Error ? error.message : "Failed to create order";
    return errorResponse(message, 500);
  }
}
