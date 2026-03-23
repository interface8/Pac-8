import { NextRequest } from "next/server";
import {
  productService,
  productFiltersSchema,
  createProductSchema,
} from "@/modules/products";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/products — list with filters 
export async function GET(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { searchParams } = new URL(request.url);
    const filters = productFiltersSchema.parse(
      Object.fromEntries(searchParams),
    );
    const products = await productService.listProducts(filters);
    return jsonResponse({ data: products });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return errorResponse(message, 500);
  }
}

// POST /api/products — create
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
      return Response.json({ message: firstError }, { status: 400 });
    }

    const product = await productService.createProduct(parsed.data);
    return jsonResponse(product, 201);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Product already exists") {
      return errorResponse("Product already exists", 409);
    }
    const message =
      error instanceof Error ? error.message : "Failed to create product";
    return errorResponse(message, 500);
  }
}
