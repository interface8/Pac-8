import { NextRequest } from "next/server";
import { orderService, orderFiltersSchema } from "@/modules/orders";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/admin/orders — list all orders with filters
export async function GET(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { searchParams } = new URL(request.url);

    const filters = orderFiltersSchema.parse({
      userId: searchParams.get("userId") || undefined,
      status: searchParams.get("status") || undefined,
      paymentStatus: searchParams.get("paymentStatus") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    const result = await orderService.listOrders(filters);
    return jsonResponse(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    return errorResponse(message, 500);
  }
}
