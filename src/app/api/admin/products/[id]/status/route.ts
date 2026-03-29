import { NextRequest } from "next/server";
import { productService, productStatusEnum } from "@/modules/products";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";
import { z } from "zod";

const statusSchema = z.object({
  status: productStatusEnum,
});

// PATCH /api/admin/products/:id/status — update product status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid status value", 400);
    }

    const product = await productService.updateProductStatus(
      id,
      parsed.data.status
    );
    return jsonResponse({ data: product });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Product not found") {
      return errorResponse("Product not found", 404);
    }
    if (
      error instanceof Error &&
      error.message.includes("Cannot activate")
    ) {
      return errorResponse(error.message, 400);
    }
    return errorResponse("Internal server error", 500);
  }
}
