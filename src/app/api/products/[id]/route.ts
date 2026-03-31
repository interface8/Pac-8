import { NextRequest } from "next/server";
import { productService } from "@/modules/products";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/products/:slug (changed from :id to :slug for customer-friendly URLs)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to get by slug first, fallback to ID for backwards compatibility
    let product;
    try {
      product = await productService.getProductBySlug(id);
    } catch {
      product = await productService.getProductById(id);
    }

    // Only show ACTIVE products to customers
    if (product.status !== "ACTIVE" || !product.isActive) {
      return errorResponse("Product not found", 404);
    }

    // Remove costPrice from customer response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { costPrice, ...customerProduct } = product;

    return jsonResponse({ data: customerProduct });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Product not found") {
      return errorResponse("Product not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}
