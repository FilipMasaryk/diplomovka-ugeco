import { z } from "zod";
import { UserRole } from "../../../types/userRoles";

export const createUserSchema = z
  .object({
    name: z.string().nonempty("errors.required"),
    surName: z.string().nonempty("errors.required"),
    email: z.string().nonempty("errors.required").email("errors.invalidEmail"),
    password: z.string().nonempty("errors.required"),
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
          path: ["countries"],
          message: "errors.required",
        });
      }
    }

    if (data.role === UserRole.BRAND_MANAGER) {
      if (!data.brands || data.brands.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["brands"],
          message: "errors.required",
        });
      }
    }

    if (data.role === UserRole.CREATOR) {
      if (!data.package) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["package"],
          message: "errors.required",
        });
      }
    }
  });

export type CreateUserPayload = z.infer<typeof createUserSchema>;
