import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .refine(
    (value) => /^\+?[0-9]{7,15}$/.test(value),
    "Phone must be 7-15 digits (optionally starting with +)",
  );

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: phoneSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  roleIds: z.array(z.string()).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  phone: phoneSchema.optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string()).optional(),
});

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  roleId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
