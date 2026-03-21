import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  address: z.string().min(1, "Address is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
});

export const updateCompanySchema = createCompanySchema.partial();
