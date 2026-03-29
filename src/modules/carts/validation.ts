import { z } from "zod";

export const addToCartSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  customPrint: z.boolean().optional().default(false),
  printText: z.string().max(500).optional(),
}).refine(
  (data) => {
    if (data.customPrint && !data.printText) {
      return false;
    }
    return true;
  },
  {
    message: "Print text is required when custom print is enabled",
    path: ["printText"],
  }
);

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive("Quantity must be at least 1").optional(),
  customPrint: z.boolean().optional(),
  printText: z.string().max(500).optional(),
  savedForLater: z.boolean().optional(),
});

export const mergeCartSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  sessionId: z.string().min(1, "Session ID is required"),
});

