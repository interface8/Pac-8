import { NextRequest } from "next/server";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSlideSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  link: z.string().optional().nullable(),
  startDate: z.string().transform((v) => new Date(v)),
  endDate: z.string().transform((v) => new Date(v)),
  isActive: z.boolean().default(true),
  type: z.enum(["homepage", "product", "category"]).default("homepage"),
  sortOrder: z.number().int().default(0),
});

// GET /api/admin/carousel — list all slides
export async function GET() {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const slides = await prisma.carousel.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return jsonResponse({ data: slides });
  } catch {
    return errorResponse("Failed to fetch carousel slides", 500);
  }
}

// POST /api/admin/carousel — create slide
export async function POST(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = createSlideSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    const slide = await prisma.carousel.create({ data: parsed.data });
    return jsonResponse({ data: slide }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create slide";
    return errorResponse(message, 500);
  }
}
