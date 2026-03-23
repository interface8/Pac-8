import { NextRequest } from "next/server";
import { companyService, createCompanySchema } from "@/modules/companies";
import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/companies — list all (auth required)
export async function GET() {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const companies = await companyService.listCompanies();
    return jsonResponse({ data: companies });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch companies";
    return errorResponse(message, 500);
  }
}

// POST /api/companies — create (auth required)
export async function POST(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = createCompanySchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return Response.json({ message: firstError }, { status: 400 });
    }

    const company = await companyService.createCompany(parsed.data);
    return jsonResponse(company, 201);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Company already exists") {
      return errorResponse("Company already exists", 409);
    }
    const message = error instanceof Error ? error.message : "Failed to create company";
    return errorResponse(message, 500);
  }
}
