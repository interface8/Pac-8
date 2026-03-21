import { prisma } from "@/lib/prisma";
import type { CartDto } from "./types";

const cartWithItems = {
  include: {
    items: {
      include: { product: true },
    },
  },
} as const;

function toCartDto(cart: {
  id: string;
  userId: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    product: {
      name: string;
      imageUrl: string | null;
      price: { toNumber: () => number };
    };
  }>;
}): CartDto {
  const items = cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productImage: item.product.imageUrl,
    price: item.product.price.toNumber(),
    quantity: item.quantity,
    subtotal: item.product.price.toNumber() * item.quantity,
  }));

  return {
    cartId: cart.id,
    userId: cart.userId,
    items,
    total: items.reduce((sum, item) => sum + item.subtotal, 0),
  };
}

export async function findCartByUserId(userId: string): Promise<CartDto | null> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    ...cartWithItems,
  });
  return cart ? toCartDto(cart) : null;
}

export async function upsertCartItem(
  userId: string,
  productId: string,
  quantity: number,
): Promise<CartDto> {
  // Find or create the user's cart
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  // Add item if new, update quantity if already exists
  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity },
    update: { quantity },
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    ...cartWithItems,
  });

  return toCartDto(updatedCart!);
}


export async function updateCartItem(
  itemId: string,
  quantity: number,
): Promise<CartDto | null> {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item) return null;

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  const cart = await prisma.cart.findUnique({
    where: { id: item.cartId },
    ...cartWithItems,
  });

  return cart ? toCartDto(cart) : null;
}

export async function deleteCartItem(
  itemId: string,
): Promise<CartDto | null> {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item) return null;

  const cartId = item.cartId;

  await prisma.cartItem.delete({ where: { id: itemId } });

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    ...cartWithItems,
  });

  return cart ? toCartDto(cart) : null;
}

