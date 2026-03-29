import * as orderRepo from "./repository";
import { productService } from "@/modules/products";
import type { CreateOrderInput, UpdateOrderInput, OrderFilters, OrderStatus } from "./types";

// ─── Valid status transitions ──────────────────────────
const STATUS_TRANSITIONS: Record<string, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export async function listOrders(filters: OrderFilters) {
  return orderRepo.findOrders(filters);
}

export async function getOrderById(id: string) {
  const order = await orderRepo.findOrderById(id);
  if (!order) throw new Error("Order not found");
  return order;
}

export async function getOrderByNumber(orderNumber: string) {
  const order = await orderRepo.findOrderByNumber(orderNumber);
  if (!order) throw new Error("Order not found");
  return order;
}

export async function getOrdersByUserId(userId: string) {
  return orderRepo.findOrdersByUserId(userId);
}

export async function createOrder(input: CreateOrderInput) {
  // Validate and snapshot all products
  const orderItems = [];
  let subtotal = 0;

  for (const item of input.items) {
    let product;
    try {
      product = await productService.getProductById(item.productId);
    } catch {
      throw new Error(`Product ${item.productId} not found`);
    }

    if (product.status !== "ACTIVE" || !product.isActive) {
      throw new Error(`Product "${product.name}" is not available`);
    }

    if (product.trackQuantity && product.quantity < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.quantity}`,
      );
    }

    if (item.customPrint && !product.allowCustomPrint) {
      throw new Error(`Custom print not available for "${product.name}"`);
    }

    const printPrice =
      item.customPrint && product.printPrice ? product.printPrice : 0;
    const unitPrice = product.price + printPrice;
    const totalPrice = unitPrice * item.quantity;

    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      customPrint: item.customPrint ?? false,
      printText: item.printText,
      unitPrice,
      totalPrice,
      productName: product.name,
      productSku: product.sku,
      productImage: product.images.find((img) => img.isMain)?.url,
    });

    subtotal += totalPrice;
  }

  const orderNumber = await orderRepo.generateOrderNumber();
  const totalAmount = subtotal; // Tax/shipping/discount can be added later

  return orderRepo.createOrder({
    orderNumber,
    userId: input.userId,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    customerName: input.customerName,
    subtotal,
    totalAmount,
    shippingAddressId: input.shippingAddressId,
    billingAddressId: input.billingAddressId,
    shippingMethod: input.shippingMethod,
    paymentMethod: input.paymentMethod,
    customerNotes: input.customerNotes,
    items: orderItems,
  });
}

export async function updateOrder(id: string, input: UpdateOrderInput) {
  const order = await orderRepo.findOrderById(id);
  if (!order) throw new Error("Order not found");

  // Validate status transition
  if (input.status && input.status !== order.status) {
    const allowed = STATUS_TRANSITIONS[order.status];
    if (!allowed?.includes(input.status)) {
      throw new Error(
        `Cannot transition from "${order.status}" to "${input.status}"`,
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (input.status) updateData.status = input.status;
  if (input.paymentStatus) updateData.paymentStatus = input.paymentStatus;
  if (input.trackingNumber !== undefined) updateData.trackingNumber = input.trackingNumber;
  if (input.shippingMethod !== undefined) updateData.shippingMethod = input.shippingMethod;
  if (input.adminNotes !== undefined) updateData.adminNotes = input.adminNotes;
  if (input.paymentReference !== undefined) updateData.paymentReference = input.paymentReference;

  // Set shipped/delivered timestamps
  if (input.status === "SHIPPED") updateData.shippedAt = new Date();
  if (input.status === "DELIVERED") updateData.deliveredAt = new Date();

  return orderRepo.updateOrder(id, updateData);
}

export async function cancelOrder(id: string) {
  return updateOrder(id, { status: "CANCELLED" });
}
