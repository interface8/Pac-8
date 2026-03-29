import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { OrderDto, OrderItemDto, OrderFilters } from "./types";

const orderWithItems = {
  include: {
    items: {
      include: {
        product: {
          select: {
            images: {
              where: { isMain: true },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.OrderDefaultArgs;

type OrderWithItems = Prisma.OrderGetPayload<typeof orderWithItems>;

function toOrderItemDto(
  item: OrderWithItems["items"][number],
): OrderItemDto {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    productSku: item.productSku,
    productImage: item.productImage ?? item.product.images[0]?.url ?? null,
    quantity: item.quantity,
    customPrint: item.customPrint,
    printText: item.printText,
    unitPrice: item.unitPrice.toNumber(),
    totalPrice: item.totalPrice.toNumber(),
  };
}

function toOrderDto(order: OrderWithItems): OrderDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    status: order.status as OrderDto["status"],
    paymentStatus: order.paymentStatus as OrderDto["paymentStatus"],
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerName: order.customerName,
    subtotal: order.subtotal.toNumber(),
    taxAmount: order.taxAmount.toNumber(),
    shippingAmount: order.shippingAmount.toNumber(),
    discountAmount: order.discountAmount.toNumber(),
    totalAmount: order.totalAmount.toNumber(),
    shippingAddressId: order.shippingAddressId,
    billingAddressId: order.billingAddressId,
    shippingMethod: order.shippingMethod,
    trackingNumber: order.trackingNumber,
    paymentMethod: order.paymentMethod,
    paymentReference: order.paymentReference,
    bankAccountInfo: order.bankAccountInfo,
    customerNotes: order.customerNotes,
    adminNotes: order.adminNotes,
    items: order.items.map(toOrderItemDto),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
  };
}

export async function findOrders(
  filters: OrderFilters = {},
): Promise<{ data: OrderDto[]; total: number; page: number; limit: number; totalPages: number }> {
  const { userId, status, paymentStatus, search, page = 1, limit = 20 } = filters;

  const where: Prisma.OrderWhereInput = {
    ...(userId && { userId }),
    ...(status && { status }),
    ...(paymentStatus && { paymentStatus }),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" as const } },
            { customerEmail: { contains: search, mode: "insensitive" as const } },
            { customerName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      ...orderWithItems,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders.map(toOrderDto),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function findOrderById(id: string): Promise<OrderDto | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    ...orderWithItems,
  });
  return order ? toOrderDto(order) : null;
}

export async function findOrderByNumber(orderNumber: string): Promise<OrderDto | null> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    ...orderWithItems,
  });
  return order ? toOrderDto(order) : null;
}

export async function findOrdersByUserId(userId: string): Promise<OrderDto[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    ...orderWithItems,
  });
  return orders.map(toOrderDto);
}

export async function createOrder(data: {
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  customerPhone?: string;
  customerName: string;
  subtotal: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  shippingAddressId?: string;
  billingAddressId?: string;
  shippingMethod?: string;
  paymentMethod?: string;
  customerNotes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    customPrint: boolean;
    printText?: string;
    unitPrice: number;
    totalPrice: number;
    productName: string;
    productSku: string;
    productImage?: string;
  }>;
}): Promise<OrderDto> {
  const order = await prisma.order.create({
    data: {
      orderNumber: data.orderNumber,
      userId: data.userId,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerName: data.customerName,
      subtotal: data.subtotal,
      taxAmount: data.taxAmount ?? 0,
      shippingAmount: data.shippingAmount ?? 0,
      discountAmount: data.discountAmount ?? 0,
      totalAmount: data.totalAmount,
      shippingAddressId: data.shippingAddressId,
      billingAddressId: data.billingAddressId,
      shippingMethod: data.shippingMethod,
      paymentMethod: data.paymentMethod,
      customerNotes: data.customerNotes,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          customPrint: item.customPrint,
          printText: item.printText,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.productImage,
        })),
      },
    },
    ...orderWithItems,
  });
  return toOrderDto(order);
}

export async function updateOrder(
  id: string,
  data: Prisma.OrderUpdateInput,
): Promise<OrderDto> {
  const order = await prisma.order.update({
    where: { id },
    data,
    ...orderWithItems,
  });
  return toOrderDto(order);
}

export async function orderExists(id: string): Promise<boolean> {
  const count = await prisma.order.count({ where: { id } });
  return count > 0;
}

export async function generateOrderNumber(): Promise<string> {
  const date = new Date();
  const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const count = await prisma.order.count({
    where: { orderNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(5, "0")}`;
}
