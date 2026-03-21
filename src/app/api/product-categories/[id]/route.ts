import { NextRequest } from "next/server";
import { categoryService, updateProductCategorySchema } from "@/modules/product-categories";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/product-categories/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

// PATCH /api/product-categories/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProductCategorySchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return Response.json({ message: firstError }, { status: 400 });
    }

    const category = await categoryService.updateCategory(id, parsed.data);
    return jsonResponse({ data: category });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Category not found") {
      return errorResponse("Category not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/product-categories/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    return errorResponse("Internal server error", 500);
  }
}
