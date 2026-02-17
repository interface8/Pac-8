import { NextRequest } from "next/server";
import { roleService, updateRoleSchema } from "@/modules/roles";
import { requireApiPermission, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

interface RouteParams {
  params: { id: string };
}

// GET /api/roles/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiPermission("roles.read");
  if (isErrorResponse(guard)) return guard;

  try {
    const role = await roleService.getRoleById(params.id);
    return jsonResponse(role);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Role not found") {
      return errorResponse("Role not found", 404);
    }
    const message = error instanceof Error ? error.message : "Failed to fetch role";
    return errorResponse(message, 500);
  }
}

// PATCH /api/roles/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiPermission("roles.update");
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = updateRoleSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const role = await roleService.updateRole(params.id, parsed.data);
    return jsonResponse(role);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update role";
    return errorResponse(message, 500);
  }
}

// DELETE /api/roles/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiPermission("roles.delete");
  if (isErrorResponse(guard)) return guard;

  try {
    await roleService.deleteRole(params.id);
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Role not found") {
      return errorResponse("Role not found", 404);
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return errorResponse(message, 500);
  }
}
