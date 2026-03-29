import { NextRequest } from "next/server";
import {
  productService,
  productFiltersSchema,
  createProductSchema,
} from "@/modules/products";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/admin/products — full product listing with all filters
export async function GET(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { searchParams } = new URL(request.url);

    const filters = productFiltersSchema.parse({
      search: searchParams.get("search") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      status: searchParams.get("status") || undefined,
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

    const products = await productService.listProducts(filters);
    return jsonResponse({ data: products });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return errorResponse(message, 500);
  }
}

// POST /api/admin/products — create product
export async function POST(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Validation failed";
      return errorResponse(firstError, 400);
    }

    const product = await productService.createProduct(parsed.data);
    return jsonResponse(product, 201);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("already exists")
    ) {
      return errorResponse(error.message, 409);
    }
    const message =
      error instanceof Error ? error.message : "Failed to create product";
    return errorResponse(message, 500);
  }
}
