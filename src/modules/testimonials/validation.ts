import { z } from "zod";

export const createTestimonialSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
});