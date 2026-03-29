import { z } from "zod";

export const addToWishlistSchema = z.object({
  productId: z.string().min(1, "Product is required"),
});

export const mergeWishlistSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  sessionId: z.string().min(1, "Session ID is required"),
});
