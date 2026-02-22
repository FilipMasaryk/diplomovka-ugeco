import { z } from "zod";
import { Countries } from "../../../types/countryEnum";
import { BrandCategory } from "../../../types/brandCategories";

export const createBrandSchema = z.object({
  name: z.string().min(1, "errors.required"),
  ico: z.string().optional(),
  address: z.string().min(1, "errors.required"),
  city: z.string().min(1, "errors.required"),
  zip: z.string().min(1, "errors.required"),
  country: z
    .string()
    .min(1, "errors.required")
    .refine((val) => (Object.values(Countries) as string[]).includes(val), {
      message: "errors.required",
    }),
  categories: z.array(z.nativeEnum(BrandCategory)).min(1, "errors.required"),
  package: z.string().optional(),
  mainContact: z.string().optional(),
});

export type CreateBrandFormData = z.infer<typeof createBrandSchema>;
