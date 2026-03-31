import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/http";
import { getCurrentUser } from "@/lib/auth/session";

// GET /api/designs/[id] — get a single saved design
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    const design = await prisma.savedDesign.findUnique({
      where: { id },
    });

    if (!design || design.userId !== user.id) {
      return errorResponse("Design not found", 404);
    }

    return jsonResponse({
      data: {
        id: design.id,
        productId: design.productId,
        name: design.name,
        status: design.status,
        designData: design.designData,
        thumbnailUrl: design.thumbnailUrl,
        createdAt: design.createdAt.toISOString(),
        updatedAt: design.updatedAt.toISOString(),
      },
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

// PATCH /api/designs/[id] — update a saved design
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    const existing = await prisma.savedDesign.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return errorResponse("Design not found", 404);
    }

    const body = await request.json();
    const { name, designData, status, thumbnailUrl } = body;

    // Validate designData if provided
    if (designData) {
      try {
        JSON.parse(designData);
      } catch {
        return errorResponse("designData must be a valid JSON string", 400);
      }
    }

    // Validate status if provided
    const validStatuses = ["DRAFT", "COMPLETED", "ARCHIVED"];
    if (status && !validStatuses.includes(status)) {
      return errorResponse(`status must be one of: ${validStatuses.join(", ")}`, 400);
    }

    const design = await prisma.savedDesign.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(designData !== undefined && { designData }),
        ...(status !== undefined && { status }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      },
    });

    return jsonResponse({
      data: {
        id: design.id,
        name: design.name,
        status: design.status,
        updatedAt: design.updatedAt.toISOString(),
      },
      message: "Design updated successfully",
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/designs/[id] — delete a saved design
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    const existing = await prisma.savedDesign.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return errorResponse("Design not found", 404);
    }

    await prisma.savedDesign.delete({ where: { id } });

    return jsonResponse({ message: "Design deleted successfully" });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
