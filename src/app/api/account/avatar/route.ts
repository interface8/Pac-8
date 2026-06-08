import { NextRequest } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { requireApiAuth, isErrorResponse, getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatars");
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
    return errorResponse("File type not allowed. Use JPEG, PNG, WebP, or GIF.", 400);
  }

  if (file.size > MAX_SIZE) {
    return errorResponse("File too large. Maximum size is 5 MB.", 400);
  }

  // Ensure upload directory exists
  if (!existsSync(AVATAR_DIR)) {
    await mkdir(AVATAR_DIR, { recursive: true });
  }

  // Remove old avatar if stored locally
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { image: true },
  });

  if (currentUser?.image?.startsWith("/uploads/avatars/")) {
    const oldPath = path.join(process.cwd(), "public", currentUser.image);
    try {
      await unlink(oldPath);
    } catch {
      // Ignore if file doesn't exist
    }
  }

  // Save new file
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ALLOWED_TYPES.includes(`image/${ext}`) ? ext : "jpg";
  const fileName = `${user.id}-${Date.now()}.${safeExt}`;
  const filePath = path.join(AVATAR_DIR, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const imageUrl = `/uploads/avatars/${fileName}`;

  await prisma.user.update({
    where: { id: user.id },
    data: { image: imageUrl },
  });

  return jsonResponse({ data: { imageUrl } });
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

  // Delete file if stored locally
  if (currentUser.image.startsWith("/uploads/avatars/")) {
    const filePath = path.join(process.cwd(), "public", currentUser.image);
    try {
      await unlink(filePath);
    } catch {
      // Ignore missing file
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { image: null },
  });

  return jsonResponse({ message: "Profile picture removed" });
}
