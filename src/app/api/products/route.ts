import { NextRequest } from "next/server";
import { productService, productFiltersSchema } from "@/modules/products";
import type { ProductDto } from "@/modules/products";
import { jsonResponse, errorResponse } from "@/lib/http";

type CustomerProduct = Omit<ProductDto, "costPrice">;

function stripCostPrice(product: ProductDto): CustomerProduct {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { costPrice, ...rest } = product;
  return rest;
}

// GET /api/products — public product listing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = productFiltersSchema.parse({
      search: searchParams.get("search") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      isFeatured: searchParams.get("isFeatured") === "true" ? true : undefined,
      isLowBudget: searchParams.get("isLowBudget") === "true" ? true : undefined,
      minPrice: searchParams.get("minPrice")
        ? parseFloat(searchParams.get("minPrice")!)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseFloat(searchParams.get("maxPrice")!)
        : undefined,
      inStock: searchParams.get("inStock") === "true" ? true : undefined,
    });

    const products = await productService.listProducts({
      ...filters,
      status: "ACTIVE",
    });

    const customerProducts = products
      .filter((p) => p.isActive)
      .map(stripCostPrice);

    return jsonResponse({ data: customerProducts });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return errorResponse(message, 500);
  }
}
