import { NextRequest } from "next/server";
import { userService, createUserSchema, userFiltersSchema } from "@/modules/users";
import { requireApiPermission, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/users — List users (permission: users.read)
export async function GET(request: NextRequest) {
  const guard = await requireApiPermission("users.read");
  if (isErrorResponse(guard)) return guard;

  try {
    const { searchParams } = new URL(request.url);
    const filters = userFiltersSchema.parse(Object.fromEntries(searchParams));
    const result = await userService.listUsers(filters);
    return jsonResponse(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return errorResponse(message, 500);
  }
}

// POST /api/users — Create user (permission: users.create)
export async function POST(request: NextRequest) {
  const guard = await requireApiPermission("users.create");
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const user = await userService.createUser(parsed.data);
    return jsonResponse(user, 201);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Email already in use") {
      return errorResponse("Email already in use", 409);
    }
    const message = error instanceof Error ? error.message : "Failed to create user";
    return errorResponse(message, 500);
  }
}
