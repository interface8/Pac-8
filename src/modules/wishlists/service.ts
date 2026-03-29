import * as wishlistRepo from "./repository";
import { productService } from "@/modules/products";
import type { AddToWishlistInput, MergeWishlistInput } from "./types";

export async function getWishlist(userId?: string, sessionId?: string) {
  if (!userId && !sessionId) {
    throw new Error("Either userId or sessionId is required");
  }

  return userId
    ? wishlistRepo.findByUserId(userId)
    : wishlistRepo.findBySessionId(sessionId!);
}

export async function addToWishlist(input: AddToWishlistInput) {
  if (!input.userId && !input.sessionId) {
    throw new Error("Either userId or sessionId is required");
  }

  // Validate product exists and is active
  let product;
  try {
    product = await productService.getProductById(input.productId);
  } catch {
    throw new Error("Product not found");
  }

  if (product.status !== "ACTIVE" || !product.isActive) {
    throw new Error("Product is not available");
  }

  // Check if already in wishlist
  const exists = await wishlistRepo.isInWishlist(
    input.productId,
    input.userId,
    input.sessionId,
  );
  if (exists) {
    throw new Error("Product already in wishlist");
  }

  return wishlistRepo.addItem(input.productId, input.userId, input.sessionId);
}

export async function removeFromWishlist(id: string) {
  return wishlistRepo.removeItem(id);
}

export async function toggleWishlist(input: AddToWishlistInput) {
  const exists = await wishlistRepo.isInWishlist(
    input.productId,
    input.userId,
    input.sessionId,
  );

  if (exists) {
    await wishlistRepo.removeByProduct(input.productId, input.userId, input.sessionId);
    return { added: false };
  }

  await wishlistRepo.addItem(input.productId, input.userId, input.sessionId);
  return { added: true };
}

export async function mergeGuestWishlist(input: MergeWishlistInput) {
  return wishlistRepo.mergeGuestToUser(input.userId, input.sessionId);
}
