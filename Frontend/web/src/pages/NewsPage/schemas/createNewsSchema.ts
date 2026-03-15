import { z } from "zod";

export const createNewsSchema = z.object({
  title: z.string().min(1, "validation.required"),
  description: z
    .string()
    .min(1, "validation.required")
    .max(2000, "newsPage.form.descriptionMax"),
  category: z.enum(["fix", "feature", "bug"], {
    message: "validation.required",
  }),
  target: z.enum(["all", "brand_manager", "creator"], {
    message: "validation.required",
  }),
});
