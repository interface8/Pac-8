import { NextRequest } from "next/server";
import { addressService, updateAddressSchema } from "@/modules/addresses";
import { requireApiAuth, isErrorResponse, getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

// GET /api/addresses/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    const address = await addressService.getAddressById(id);

    if (address.userId !== user.id) {
      return errorResponse("Address not found", 404);
    }

    return jsonResponse({ data: address });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Address not found") {
      return errorResponse("Address not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}

// PATCH /api/addresses/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    const body = await request.json();
    const parsed = updateAddressSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    const address = await addressService.updateAddress(id, user.id, parsed.data);
    return jsonResponse({ data: address });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Address not found") {
      return errorResponse("Address not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/addresses/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    await addressService.deleteAddress(id, user.id);
    return jsonResponse({ message: "Address deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Address not found") {
      return errorResponse("Address not found", 404);
    }
    return errorResponse("Internal server error", 500);
  }
}
