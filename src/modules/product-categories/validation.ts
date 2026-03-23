import { z } from "zod";

export const createProductCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  sort: z.number().int().min(0, "Sort must be 0 or greater"),
});

export const updateProductCategorySchema = createProductCategorySchema.partial();
