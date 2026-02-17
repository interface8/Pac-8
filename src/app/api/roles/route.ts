import { NextRequest } from "next/server";
import { roleService, createRoleSchema } from "@/modules/roles";
import { requireApiPermission, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/roles — List all roles (permission: roles.read)
export async function GET() {
  const guard = await requireApiPermission("roles.read");
  if (isErrorResponse(guard)) return guard;

  try {
    const roles = await roleService.listRoles();
    return jsonResponse(roles);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch roles";
    return errorResponse(message, 500);
  }
}

// POST /api/roles — Create role (permission: roles.create)
export async function POST(request: NextRequest) {
  const guard = await requireApiPermission("roles.create");
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = createRoleSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const role = await roleService.createRole(parsed.data);
    return jsonResponse(role, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create role";
    return errorResponse(message, 500);
  }
}
