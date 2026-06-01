import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/admin/designs/:id — fetch any saved design (admin only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiPermission("orders.read");
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const design = await prisma.savedDesign.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        thumbnailUrl: true,
        designData: true,
        status: true,
        createdAt: true,
      },
    });

    if (!design) return errorResponse("Design not found", 404);
    return jsonResponse({ data: design });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
