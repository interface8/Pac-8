import { NextRequest } from "next/server";
import { z } from "zod";
import { userService } from "@/modules/users";
import { signJwt, setAuthCookie } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid credentials format";
      return errorResponse(firstError, 400);
    }

    const { email, password } = parsed.data;
    const user = await userService.verifyCredentials(email, password);

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const token = await signJwt({ sub: user.id, email: user.email });
    await setAuthCookie(token);

    return jsonResponse({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Internal server error", 500);
  }
}
