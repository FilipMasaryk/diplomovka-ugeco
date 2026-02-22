import { z } from "zod";
import { UserRole } from "../../../types/userRoles";

export const updateUserSchema = z
  .object({
    name: z.string().min(1, "errors.required"),
    surName: z.string().min(1, "errors.required"),
    email: z.string().email("errors.invalidEmail"),
    role: z.nativeEnum(UserRole),
    countries: z.array(z.string()).optional(),
    brands: z.array(z.string()).optional(),
    package: z.string().optional(),
    ico: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== UserRole.ADMIN) {
      if (!data.countries || data.countries.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "errors.required",
          path: ["countries"],
        });
      }
    }

    if (data.role === UserRole.CREATOR) {
      if (!data.package || data.package === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "errors.required",
          path: ["package"],
        });
      }
    }

    if (data.role === UserRole.BRAND_MANAGER) {
      if (!data.brands || data.brands.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "errors.required",
          path: ["brands"],
        });
      }
    }
  });
