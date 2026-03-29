import { NextRequest } from "next/server";
import {
  categoryService,
  categoryFiltersSchema,
  createCategorySchema,
} from "@/modules/categories";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/admin/categories — list or tree (all categories, including inactive)
export async function GET(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    if (format === "tree") {
      // Return full hierarchical tree (including inactive)
      const tree = await categoryService.getCategoryTree(false);
      return jsonResponse({ data: tree });
    }

    // Return flat list with filters
    const filters = categoryFiltersSchema.parse({
      parentId:
        searchParams.get("parentId") === "null"
          ? null
          : searchParams.get("parentId") || undefined,
      isActive:
        searchParams.get("isActive") === "true"
          ? true
          : searchParams.get("isActive") === "false"
          ? false
          : undefined,
      search: searchParams.get("search") || undefined,
    });

    const categories = await categoryService.listCategories(filters);
    return jsonResponse({ data: categories });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch categories";
    return errorResponse(message, 500);
  }
}

// POST /api/admin/categories — create
export async function POST(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Validation failed";
      return errorResponse(firstError, 400);
    }

    const category = await categoryService.createCategory(parsed.data);
    return jsonResponse(category, 201);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("already exists")
    ) {
      return errorResponse(error.message, 409);
    }
    if (
      error instanceof Error &&
      error.message === "Parent category not found"
    ) {
      return errorResponse(error.message, 404);
    }
    const message =
      error instanceof Error ? error.message : "Failed to create category";
    return errorResponse(message, 500);
  }
}
