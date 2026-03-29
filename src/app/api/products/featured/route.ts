import { NextRequest } from "next/server";
import { productService } from "@/modules/products";
import type { ProductDto } from "@/modules/products";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/products/featured — get featured products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;

    const products = await productService.listProducts({
      isFeatured: true,
      status: "ACTIVE",
    });

    const stripCost = (product: ProductDto) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { costPrice, ...rest } = product;
      return rest;
    };

    const featuredProducts = products
      .filter((p) => p.isActive)
      .slice(0, limit)
      .map(stripCost);

    return jsonResponse({ data: featuredProducts });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch featured products";
    return errorResponse(message, 500);
  }
}
