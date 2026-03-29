import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { CartDto, CartItemDto, AddToCartInput, UpdateCartItemInput } from "./types";

const cartWithItems = {
  include: {
    items: {
      where: { savedForLater: false },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            price: true,
            printPrice: true,
            quantity: true,
            images: {
              where: { isMain: true },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" as const },
    },
  },
} satisfies Prisma.CartDefaultArgs;

type CartWithItems = Prisma.CartGetPayload<typeof cartWithItems>;

function toCartDto(cart: CartWithItems): CartDto {
  const items: CartItemDto[] = cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productSlug: item.product.slug,
    productImage: item.product.images[0]?.url || null,
    quantity: item.quantity,
    customPrint: item.customPrint,
    printText: item.printText,
    unitPrice: item.unitPrice.toNumber(),
    totalPrice: item.totalPrice.toNumber(),
    savedForLater: item.savedForLater,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return {
    id: cart.id,
    userId: cart.userId,
    sessionId: cart.sessionId,
    items,
    subtotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    savedForLater: cart.savedForLater,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}

export async function findCartByUserId(userId: string): Promise<CartDto | null> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    ...cartWithItems,
  });
  return cart ? toCartDto(cart) : null;
}

export async function findCartBySessionId(sessionId: string): Promise<CartDto | null> {
  const cart = await prisma.cart.findUnique({
    where: { sessionId },
    ...cartWithItems,
  });
  return cart ? toCartDto(cart) : null;
}

export async function addToCart(input: AddToCartInput): Promise<CartDto> {
  // Get product to calculate prices
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: { price: true, printPrice: true, quantity: true },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Calculate unit price (base + print if custom)
  const basePrice = product.price.toNumber();
  const printPrice = input.customPrint && product.printPrice
    ? product.printPrice.toNumber()
    : 0;
  const unitPrice = basePrice + printPrice;
  const totalPrice = unitPrice * input.quantity;

  // Find or create cart
  const cartWhere = input.userId
    ? { userId: input.userId }
    : { sessionId: input.sessionId! };

  const cart = await prisma.cart.upsert({
    where: cartWhere,
    create: {
      userId: input.userId,
      sessionId: input.sessionId,
    },
    update: {},
  });

  // Check if item already exists
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: input.productId,
      customPrint: input.customPrint ?? false,
      printText: input.printText,
    },
  });

  if (existingItem) {
    // Update existing item
    const newQuantity = existingItem.quantity + input.quantity;
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: newQuantity,
        totalPrice: unitPrice * newQuantity,
      },
    });
  } else {
    // Create new item
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: input.productId,
        quantity: input.quantity,
        customPrint: input.customPrint ?? false,
        printText: input.printText,
        unitPrice,
        totalPrice,
      },
    });
  }

  // Return updated cart
  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    ...cartWithItems,
  });

  return toCartDto(updatedCart!);
}

export async function updateCartItem(
  itemId: string,
  input: UpdateCartItemInput
): Promise<CartDto | null> {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      product: {
        select: { price: true, printPrice: true },
      },
    },
  });

  if (!item) return null;

  // Recalculate prices if quantity or customPrint changes
  let unitPrice = item.unitPrice.toNumber();
  let totalPrice = item.totalPrice.toNumber();

  if (input.customPrint !== undefined || input.quantity !== undefined) {
    const basePrice = item.product.price.toNumber();
    const printPrice =
      (input.customPrint ?? item.customPrint) && item.product.printPrice
        ? item.product.printPrice.toNumber()
        : 0;
    unitPrice = basePrice + printPrice;
    totalPrice = unitPrice * (input.quantity ?? item.quantity);
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: {
      ...input,
      ...(input.quantity !== undefined || input.customPrint !== undefined
        ? { unitPrice, totalPrice }
        : {}),
    },
  });

  const cart = await prisma.cart.findUnique({
    where: { id: item.cartId },
    ...cartWithItems,
  });

  return cart ? toCartDto(cart) : null;
}

export async function deleteCartItem(itemId: string): Promise<CartDto | null> {
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

export async function clearCart(cartId: string): Promise<void> {
  await prisma.cartItem.deleteMany({ where: { cartId } });
}

export async function mergeGuestCartToUser(
  userId: string,
  sessionId: string
): Promise<CartDto | null> {
  const userCart = await prisma.cart.findUnique({ where: { userId } });
  const guestCart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) {
    // No guest cart to merge
    return userCart
      ? toCartDto(
          (await prisma.cart.findUnique({
            where: { id: userCart.id },
            ...cartWithItems,
          }))!
        )
      : null;
  }

  // Create user cart if doesn't exist
  const targetCart = userCart
    ? userCart
    : await prisma.cart.create({ data: { userId } });

  // Move items from guest cart to user cart
  await prisma.cartItem.updateMany({
    where: { cartId: guestCart.id },
    data: { cartId: targetCart.id },
  });

  // Delete guest cart
  await prisma.cart.delete({ where: { id: guestCart.id } });

  const updatedCart = await prisma.cart.findUnique({
    where: { id: targetCart.id },
    ...cartWithItems,
  });

  return updatedCart ? toCartDto(updatedCart) : null;
}

export async function findAllCarts(): Promise<CartDto[]> {
  const carts = await prisma.cart.findMany({
    ...cartWithItems,
    orderBy: { updatedAt: "desc" },
  });
  return carts.map(toCartDto);
}

