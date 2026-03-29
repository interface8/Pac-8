import { z } from "zod";

export const addressTypeEnum = z.enum(["SHIPPING", "BILLING"]);

export const createAddressSchema = z.object({
  type: addressTypeEnum.optional().default("SHIPPING"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  company: z.string().max(200).optional(),
  addressLine1: z.string().min(1, "Address is required").max(300),
  addressLine2: z.string().max(300).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  country: z.string().max(100).optional().default("US"),
  phone: z.string().max(20).optional(),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();
