import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const skuRegex = /^[A-Z0-9-]+$/;

export const productStatusEnum = z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]);

export const createProductSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(200),
    slug: z
      .string()
      .regex(slugRegex, "Slug must be lowercase alphanumeric with hyphens")
      .max(200)
      .optional(),
    sku: z
      .string()
      .min(1, "SKU is required")
      .max(50)
      .regex(skuRegex, "SKU must be uppercase alphanumeric with hyphens"),
    description: z.string().max(5000).optional(),
    shortDescription: z.string().max(500).optional(),
    price: z.number().positive("Price must be greater than 0"),
    comparePrice: z.number().positive().optional(),
    costPrice: z.number().positive().optional(),
    quantity: z.number().int().min(0, "Quantity cannot be negative").optional().default(0),
    trackQuantity: z.boolean().optional().default(true),
    lowStockThreshold: z.number().int().min(0).optional().default(5),
    deliveryTime: z.string().max(100).optional(),
    weight: z.number().positive().optional(),
    dimensions: z.string().max(200).optional(),
    allowCustomPrint: z.boolean().optional().default(false),
    printPrice: z.number().positive().optional(),
    status: productStatusEnum.optional().default("DRAFT"),
    isActive: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
    isLowBudget: z.boolean().optional().default(false),
    categoryId: z.string().min(1, "Category is required"),
    productCategoryId: z.string().optional(),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
    metaKeywords: z.string().max(255).optional(),
  })
  .refine(
    (data) => {
      if (data.comparePrice && data.price) {
        return data.comparePrice >= data.price;
      }
      return true;
    },
    {
      message: "Compare price must be greater than or equal to regular price",
      path: ["comparePrice"],
    }
  )
  .refine(
    (data) => {
      if (data.allowCustomPrint && !data.printPrice) {
        return false;
      }
      return true;
    },
    {
      message: "Print price is required when custom print is allowed",
      path: ["printPrice"],
    }
  );

export const updateProductSchema = createProductSchema.partial();

export const productFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: productStatusEnum.optional(),
  isFeatured: z.boolean().optional(),
  isLowBudget: z.boolean().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  inStock: z.boolean().optional(),
  productCategoryId: z.string().optional(),
});

export const addProductImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  altText: z.string().max(200).optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isMain: z.boolean().optional().default(false),
});
