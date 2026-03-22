import { NextRequest } from "next/server";
import { companyService, updateCompanySchema } from "@/modules/companies";
import {isErrorResponse, requireApiAuth } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/companies/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const company = await companyService.getCompanyById(id);
    return jsonResponse({ data: company });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Company not found") {
      return errorResponse("Company not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}

// PATCH /api/companies/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateCompanySchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return Response.json({ message: firstError }, { status: 400 });
    }

    const company = await companyService.updateCompany(id, parsed.data);
    return jsonResponse({ data: company });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Company not found") {
      return errorResponse("Company not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/companies/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const { id } = await params;
    await companyService.deleteCompany(id);
    return jsonResponse({ message: "Company deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Company not found") {
      return errorResponse("Company not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}
