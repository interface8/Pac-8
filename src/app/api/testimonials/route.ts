import { jsonResponse, errorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

// GET /api/testimonials — public visible testimonials
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    });

    return jsonResponse({ data: testimonials });
  } catch {
    return errorResponse("Failed to fetch testimonials", 500);
  }
}
