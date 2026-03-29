import { NextRequest } from "next/server";
import { productService } from "@/modules/products";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// DELETE /api/admin/products/:id/images/:imageId
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { imageId } = await params;
    await productService.removeProductImage(imageId);
    return jsonResponse({ message: "Image deleted successfully" });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

// PATCH /api/admin/products/:id/images/:imageId/set-main
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id, imageId } = await params;
    await productService.setMainProductImage(id, imageId);
    return jsonResponse({ message: "Main image updated successfully" });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Product not found") {
      return errorResponse("Product not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}
