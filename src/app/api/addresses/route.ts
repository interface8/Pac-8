import { NextRequest } from "next/server";
import { addressService, createAddressSchema } from "@/modules/addresses";
import { requireApiAuth, isErrorResponse, getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/addresses — list current user's addresses
export async function GET() {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const addresses = await addressService.getAddresses(user.id);
    return jsonResponse({ data: addresses });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch addresses";
    return errorResponse(message, 500);
  }
}

// POST /api/addresses — create address
export async function POST(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await request.json();
    const parsed = createAddressSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    const address = await addressService.createAddress(user.id, parsed.data);
    return jsonResponse(address, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create address";
    return errorResponse(message, 500);
  }
}
