import * as cartRepo from "./repository";
import { productService } from "@/modules/products";
import type { AddToCartInput, UpdateCartItemInput, MergeCartInput } from "./types";

export async function getCart(userId?: string, sessionId?: string) {
  if (!userId && !sessionId) {
    throw new Error("Either userId or sessionId is required");
  }

  const cart = userId
    ? await cartRepo.findCartByUserId(userId)
    : await cartRepo.findCartBySessionId(sessionId!);

  // Return empty cart structure if none exists
  if (!cart) {
    return {
      id: "",
      userId: userId || null,
      sessionId: sessionId || null,
      items: [],
      subtotal: 0,
      totalItems: 0,
      savedForLater: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return cart;
}

export async function addToCart(input: AddToCartInput) {
  // Validate product exists and is available
  let product;
  try {
    product = await productService.getProductById(input.productId);
  } catch {
    throw new Error("Product not found");
  }

  if (product.status !== "ACTIVE" || !product.isActive) {
    throw new Error("Product is not available");
  }

  // Check stock if tracking quantity
  if (product.trackQuantity) {
    if (product.quantity === 0) {
      throw new Error("Product is out of stock");
    }
    if (input.quantity > product.quantity) {
      throw new Error(`Only ${product.quantity} items available in stock`);
    }
  }

  // Validate custom print
  if (input.customPrint && !product.allowCustomPrint) {
    throw new Error("Custom print is not available for this product");
  }

  if (input.customPrint && !input.printText) {
    throw new Error("Print text is required for custom print");
  }

  return cartRepo.addToCart(input);
}

export async function updateCartItem(itemId: string, input: UpdateCartItemInput) {
  const updated = await cartRepo.updateCartItem(itemId, input);
  if (!updated) throw new Error("Cart item not found");
  return updated;
}

export async function removeCartItem(itemId: string) {
  const updated = await cartRepo.deleteCartItem(itemId);
  if (!updated) throw new Error("Cart item not found");
  return updated;
}

export async function clearCart(cartId: string) {
  return cartRepo.clearCart(cartId);
}

export async function mergeGuestCart(input: MergeCartInput) {
  return cartRepo.mergeGuestCartToUser(input.userId, input.sessionId);
}

// Admin function
export async function listAllCarts() {
  return cartRepo.findAllCarts();
}
