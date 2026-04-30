import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// PATCH /api/admin/products/[id]/views/[viewId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; viewId: string }> }
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id, viewId } = await params;

    const existing = await prisma.productView.findUnique({
      where: { id: viewId },
    });

    if (!existing || existing.productId !== id) {
      return errorResponse("View not found", 404);
    }

    const body = await request.json();
    const { name, baseImageUrl, description, sortOrder, isDefault } = body;

    // If setting this as default, clear existing default first
    if (isDefault) {
      await prisma.productView.updateMany({
        where: { productId: id, isDefault: true, id: { not: viewId } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.productView.update({
      where: { id: viewId },
      data: {
        ...(name !== undefined && { name }),
        ...(baseImageUrl !== undefined && { baseImageUrl }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return jsonResponse({ data: updated });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/admin/products/[id]/views/[viewId]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; viewId: string }> }
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id, viewId } = await params;

    const existing = await prisma.productView.findUnique({
      where: { id: viewId },
    });

    if (!existing || existing.productId !== id) {
      return errorResponse("View not found", 404);
    }

    await prisma.productView.delete({ where: { id: viewId } });

    return jsonResponse({ message: "View deleted successfully" });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
