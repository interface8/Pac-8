import { NextRequest } from "next/server";
import { userService, updateUserSchema } from "@/modules/users";
import { requireApiPermission, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

interface RouteParams {
  params: { id: string };
}

// GET /api/users/[id] — Get single user (permission: users.read)
export async function GET(request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiPermission("users.read");
  if (isErrorResponse(guard)) return guard;

  try {
    const user = await userService.getUserById(params.id);
    return jsonResponse(user);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "User not found") {
      return errorResponse("User not found", 404);
    }
    const message =
      error instanceof Error ? error.message : "Failed to fetch user";
    return errorResponse(message, 500);
  }
}

// PATCH /api/users/[id] — Update user (permission: users.update)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiPermission("users.update");
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const user = await userService.updateUser(params.id, parsed.data);
    return jsonResponse(user);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Email already in use") {
      return errorResponse("Email already in use", 409);
    }
    if (error instanceof Error && error.message === "Phone already in use") {
      return errorResponse("Phone already in use", 409);
    }

    const message =
      error instanceof Error ? error.message : "Failed to update user";
    return errorResponse(message, 500);
  }
}

// DELETE /api/users/[id] — Delete user (permission: users.delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiPermission("users.delete");
  if (isErrorResponse(guard)) return guard;

  try {
    await userService.deleteUser(params.id);
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "User not found") {
      return errorResponse("User not found", 404);
    }
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return errorResponse(message, 500);
  }
}
