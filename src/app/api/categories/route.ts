import { NextRequest } from "next/server";
import { categoryService, categoryFiltersSchema } from "@/modules/categories";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/categories — list or tree
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format"); // 'tree' for hierarchical, default for flat list

    if (format === "tree") {
      // Return hierarchical tree structure (only active categories for customers)
      const tree = await categoryService.getCategoryTree(true);
      return jsonResponse({ data: tree });
    }

    // Return flat list with filters
    const filters = categoryFiltersSchema.parse({
      parentId:
        searchParams.get("parentId") === "null"
          ? null
          : searchParams.get("parentId") || undefined,
      isActive: searchParams.get("isActive") === "true" ? true : undefined,
      search: searchParams.get("search") || undefined,
    });

    // For customers, always filter to active only
    const categories = await categoryService.listCategories({
      ...filters,
      isActive: true,
    });

    return jsonResponse({ data: categories });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch categories";
    return errorResponse(message, 500);
  }
}
