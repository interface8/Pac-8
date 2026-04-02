import { NextRequest } from "next/server";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSlideSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  link: z.string().optional().nullable(),
  startDate: z.string().transform((v) => new Date(v)).optional(),
  endDate: z.string().transform((v) => new Date(v)).optional(),
  isActive: z.boolean().optional(),
  type: z.enum(["homepage", "product", "category"]).optional(),
  sortOrder: z.number().int().optional(),
});

// GET /api/admin/carousel/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const slide = await prisma.carousel.findUnique({ where: { id } });
    if (!slide) return errorResponse("Slide not found", 404);
    return jsonResponse({ data: slide });
  } catch {
    return errorResponse("Failed to fetch slide", 500);
  }
}

// PATCH /api/admin/carousel/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSlideSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    const slide = await prisma.carousel.update({
      where: { id },
      data: parsed.data,
    });
    return jsonResponse({ data: slide });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return errorResponse("Slide not found", 404);
    }
    const message = error instanceof Error ? error.message : "Failed to update slide";
    return errorResponse(message, 500);
  }
}

// DELETE /api/admin/carousel/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    await prisma.carousel.delete({ where: { id } });
    return jsonResponse({ message: "Slide deleted" });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return errorResponse("Slide not found", 404);
    }
    return errorResponse("Failed to delete slide", 500);
  }
}
