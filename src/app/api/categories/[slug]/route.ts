import { NextRequest } from "next/server";
import { categoryService } from "@/modules/categories";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/categories/:slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const category = await categoryService.getCategoryBySlug(slug);

    // Only return active categories to customers
    if (!category.isActive) {
      return errorResponse("Category not found", 404);
    }

    return jsonResponse({ data: category });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Category not found") {
      return errorResponse("Category not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}
