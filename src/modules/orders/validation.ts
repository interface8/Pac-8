import { z } from "zod";

export const orderStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

export const paymentStatusEnum = z.enum([
  "AWAITING_PAYMENT",
  "PAID",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
]);

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  customPrint: z.boolean().optional().default(false),
  printText: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  userId: z.string().optional(),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().max(20).optional(),
  customerName: z.string().min(1, "Customer name is required").max(200),
  shippingAddressId: z.string().optional(),
  billingAddressId: z.string().optional(),
  shippingMethod: z.string().max(100).optional(),
  paymentMethod: z.string().max(100).optional(),
  customerNotes: z.string().max(1000).optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export const updateOrderSchema = z.object({
  status: orderStatusEnum.optional(),
  paymentStatus: paymentStatusEnum.optional(),
  trackingNumber: z.string().max(100).optional(),
  shippingMethod: z.string().max(100).optional(),
  adminNotes: z.string().max(2000).optional(),
  paymentReference: z.string().max(200).optional(),
});

export const orderFiltersSchema = z.object({
  userId: z.string().optional(),
  status: orderStatusEnum.optional(),
  paymentStatus: paymentStatusEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
