import { NextRequest } from "next/server";
import { permissionService, createPermissionSchema } from "@/modules/permissions";
import { requireApiPermission, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/permissions
export async function GET() {
  const guard = await requireApiPermission("permissions.read");
  if (isErrorResponse(guard)) return guard;

  try {
    const permissions = await permissionService.listPermissions();
    return jsonResponse(permissions);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch permissions";
    return errorResponse(message, 500);
  }
}

// POST /api/permissions
export async function POST(request: NextRequest) {
  const guard = await requireApiPermission("permissions.create");
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = createPermissionSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const permission = await permissionService.createPermission(parsed.data);
    return jsonResponse(permission, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create permission";
    return errorResponse(message, 500);
  }
}
