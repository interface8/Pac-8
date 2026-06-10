import { NextRequest } from "next/server";
import { put, del } from "@vercel/blob";
import { requireApiAuth, isErrorResponse, getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// POST /api/account/avatar — upload profile picture
export async function POST(request: NextRequest) {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  const user = await getCurrentUser();
  if (!user) return errorResponse("Unauthorized", 401);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Invalid form data", 400);
  }

  const file = formData.get("avatar");
  if (!file || !(file instanceof File)) {
    return errorResponse("No avatar file provided", 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return errorResponse(
      "File type not allowed. Use JPEG, PNG, WebP, or GIF.",
      400
    );
  }

  if (file.size > MAX_SIZE) {
    return errorResponse("File too large. Maximum size is 5 MB.", 400);
  }

  // Delete old avatar from Vercel Blob if it exists
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { image: true },
  });

  if (currentUser?.image?.includes("vercel-storage.com")) {
    try {
      await del(currentUser.image);
    } catch {
      // Ignore if already deleted
    }
  }

  // Upload to Vercel Blob
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const fileName = `avatars/${user.id}-${Date.now()}.${ext}`;

  const blob = await put(fileName, file, {
    access: "public",
    contentType: file.type,
  });

  // Save URL to DB
  await prisma.user.update({
    where: { id: user.id },
    data: { image: blob.url },
  });

  return jsonResponse({ data: { imageUrl: blob.url } });
}

// DELETE /api/account/avatar — remove profile picture
export async function DELETE() {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  const user = await getCurrentUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { image: true },
  });

  if (!currentUser?.image) {
    return errorResponse("No profile picture to remove", 404);
  }

  // Delete from Vercel Blob
  if (currentUser.image.includes("vercel-storage.com")) {
    try {
      await del(currentUser.image);
    } catch {
      // Ignore if already deleted
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { image: null },
  });

  return jsonResponse({ message: "Profile picture removed" });
}