import { NextRequest } from "next/server";
import { productService, updateProductSchema } from "@/modules/products";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/admin/products/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const product = await productService.getProductById(id);
    return jsonResponse({ data: product });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Product not found") {
      return errorResponse("Product not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}

// PATCH /api/admin/products/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Validation failed";
      return errorResponse(firstError, 400);
    }

    const product = await productService.updateProduct(id, parsed.data);
    return jsonResponse({ data: product });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Product not found") {
      return errorResponse("Product not found", 404);
    }
    if (
      error instanceof Error &&
      error.message.includes("already exists")
    ) {
      return errorResponse(error.message, 409);
    }
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/admin/products/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    await productService.deleteProduct(id);
    return jsonResponse({ message: "Product deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Product not found") {
      return errorResponse("Product not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}
