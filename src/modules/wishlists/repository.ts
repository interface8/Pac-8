import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { WishlistItemDto } from "./types";

const wishlistWithProduct = {
  include: {
    product: {
      select: {
        name: true,
        slug: true,
        price: true,
        quantity: true,
        isActive: true,
        status: true,
        images: {
          where: { isMain: true },
          take: 1,
          select: { url: true },
        },
      },
    },
  },
} satisfies Prisma.WishlistDefaultArgs;

type WishlistWithProduct = Prisma.WishlistGetPayload<typeof wishlistWithProduct>;

function toWishlistItemDto(item: WishlistWithProduct): WishlistItemDto {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productSlug: item.product.slug,
    productImage: item.product.images[0]?.url ?? null,
    productPrice: item.product.price.toNumber(),
    productInStock: item.product.quantity > 0 && item.product.isActive,
    createdAt: item.createdAt,
  };
}

export async function findByUserId(userId: string): Promise<WishlistItemDto[]> {
  const items = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    ...wishlistWithProduct,
  });
  return items.map(toWishlistItemDto);
}

export async function findBySessionId(sessionId: string): Promise<WishlistItemDto[]> {
  const items = await prisma.wishlist.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    ...wishlistWithProduct,
  });
  return items.map(toWishlistItemDto);
}

export async function addItem(
  productId: string,
  userId?: string,
  sessionId?: string,
): Promise<WishlistItemDto> {
  const item = await prisma.wishlist.create({
    data: { productId, userId, sessionId },
    ...wishlistWithProduct,
  });
  return toWishlistItemDto(item);
}

export async function removeItem(id: string): Promise<void> {
  await prisma.wishlist.delete({ where: { id } });
}

export async function removeByProduct(
  productId: string,
  userId?: string,
  sessionId?: string,
): Promise<void> {
  await prisma.wishlist.deleteMany({
    where: {
      productId,
      ...(userId ? { userId } : { sessionId }),
    },
  });
}

export async function isInWishlist(
  productId: string,
  userId?: string,
  sessionId?: string,
): Promise<boolean> {
  const count = await prisma.wishlist.count({
    where: {
      productId,
      ...(userId ? { userId } : { sessionId }),
    },
  });
  return count > 0;
}

export async function mergeGuestToUser(
  userId: string,
  sessionId: string,
): Promise<void> {
  // Get guest wishlist items
  const guestItems = await prisma.wishlist.findMany({
    where: { sessionId },
    select: { productId: true },
  });

  // Get existing user product IDs to avoid duplicates
  const userItems = await prisma.wishlist.findMany({
    where: { userId },
    select: { productId: true },
  });
  const userProductIds = new Set(userItems.map((i) => i.productId));

  // Move non-duplicate items to user
  const itemsToMove = guestItems.filter((i) => !userProductIds.has(i.productId));

  if (itemsToMove.length > 0) {
    await prisma.wishlist.createMany({
      data: itemsToMove.map((i) => ({ userId, productId: i.productId })),
    });
  }

  // Delete guest wishlist
  await prisma.wishlist.deleteMany({ where: { sessionId } });
}
