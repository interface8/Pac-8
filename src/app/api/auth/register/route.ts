import { NextRequest } from "next/server";
import { userService, createUserSchema } from "@/modules/users";
import { signJwt, setAuthCookie } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

export async function POST(request: NextRequest) {
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

    const token = await signJwt({ sub: user.id, email: user.email });
    await setAuthCookie(token);

    return jsonResponse(
      {
        message: "Registration successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      201,
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === "Email already in use") {
      return errorResponse("Email already in use", 409);
    }
    console.error("Register error:", error);
    return errorResponse("Internal server error", 500);
  }
}
