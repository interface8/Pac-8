import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string().min(1, "Category is required"),
  companyId: z.string().min(1, "Company is required"),
  price: z.number().positive("Price must be greater than 0"),
  warranty: z.number().int().min(0, "Warranty cannot be negative"),
  capacity: z.number().int().min(0, "Capacity cannot be negative"),
  imageUrl: z.string().url("Invalid image URL").optional(),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative").optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  companyId: z.string().optional(),
});
