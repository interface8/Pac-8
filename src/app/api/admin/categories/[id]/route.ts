import { NextRequest } from "next/server";
import { categoryService, updateCategorySchema } from "@/modules/categories";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/admin/categories/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const category = await categoryService.getCategoryById(id);
    return jsonResponse({ data: category });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Category not found") {
      return errorResponse("Category not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}

// PATCH /api/admin/categories/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Validation failed";
      return errorResponse(firstError, 400);
    }

    const category = await categoryService.updateCategory(id, parsed.data);
    return jsonResponse({ data: category });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Category not found") {
      return errorResponse("Category not found", 404);
    }
    if (
      error instanceof Error &&
      (error.message.includes("already exists") ||
        error.message.includes("circular") ||
        error.message.includes("own parent"))
    ) {
      return errorResponse(error.message, 400);
    }
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/admin/categories/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    await categoryService.deleteCategory(id);
    return jsonResponse({ message: "Category deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Category not found") {
      return errorResponse("Category not found", 404);
    }
    if (
      error instanceof Error &&
      (error.message.includes("Cannot delete") ||
        error.message.includes("products") ||
        error.message.includes("subcategories"))
    ) {
      return errorResponse(error.message, 400);
    }
    return errorResponse("Internal server error", 500);
  }
}
