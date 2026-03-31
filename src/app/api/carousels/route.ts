import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

// GET /api/carousels?type=homepage — public active carousel slides
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "homepage";

    const now = new Date();

    const slides = await prisma.carousel.findMany({
      where: {
        isActive: true,
        type: type as "homepage" | "product" | "category",
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { sortOrder: "asc" },
    });

    return jsonResponse({ data: slides });
  } catch {
    return errorResponse("Failed to fetch carousel slides", 500);
  }
}
