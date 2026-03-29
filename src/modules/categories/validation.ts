import { z } from "zod";

// Helper to generate slug from name
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .regex(slugRegex, "Slug must be lowercase, alphanumeric with hyphens")
    .max(100)
    .optional(),
  description: z.string().max(1000).optional(),
  image: z.string().url("Invalid image URL").optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryFiltersSchema = z.object({
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});
