import { z } from "zod";

export const createPermissionSchema = z.object({
  resource: z.string().min(2, "Resource name is required"),
  action: z.string().min(2, "Action name is required"),
  description: z.string().optional(),
});

export const updatePermissionSchema = z.object({
  resource: z.string().min(2).optional(),
  action: z.string().min(2).optional(),
  description: z.string().optional(),
});
