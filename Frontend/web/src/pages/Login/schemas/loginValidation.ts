import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "errors.required" }) // i18n kľúč
    .email({ message: "errors.invalidEmail" }), // i18n kľúč
  password: z.string().nonempty({ message: "errors.required" }),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "errors.required" })
    .email({ message: "errors.invalidEmail" }),
});

export type LoginPayload = z.infer<typeof loginSchema>;
