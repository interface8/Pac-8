import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

// GET /api/faqs?category=Ordering — public visible FAQs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const faqs = await prisma.fAQ.findMany({
      where: {
        isVisible: true,
        ...(category ? { category } : {}),
      },
      orderBy: { sortOrder: "asc" },
    });

    return jsonResponse({ data: faqs });
  } catch {
    return errorResponse("Failed to fetch FAQs", 500);
  }
}
