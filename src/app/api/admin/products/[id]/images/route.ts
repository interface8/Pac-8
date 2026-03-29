import { NextRequest } from "next/server";
import { productService, addProductImageSchema } from "@/modules/products";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// POST /api/admin/products/:id/images — add product image
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = addProductImageSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Validation failed";
      return errorResponse(firstError, 400);
    }

    const image = await productService.addProductImage({
      productId: id,
      ...parsed.data,
    });

    return jsonResponse(image, 201);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Product not found") {
      return errorResponse("Product not found", 404);
    }
    const message =
      error instanceof Error ? error.message : "Failed to add image";
    return errorResponse(message, 500);
  }
}
