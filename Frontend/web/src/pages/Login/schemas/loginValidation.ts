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

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .nonempty({ message: "errors.required" })
      .min(8, { message: "errors.passwordMin" })
      .regex(/[A-Z]/, { message: "errors.passwordUppercase" })
      .regex(/[a-z]/, { message: "errors.passwordLowercase" })
      .regex(/[0-9]/, { message: "errors.passwordNumber" })
      .regex(/[!@#$%^&*(),.?":{}|<>\-_+=~`[\]\\;]/, {
        message: "errors.passwordSpecial",
      }),
    passwordConfirm: z.string().nonempty({ message: "errors.required" }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "errors.passwordsMismatch",
    path: ["passwordConfirm"],
  });

const passwordRules = z
  .string()
  .min(8, { message: "errors.passwordMin" })
  .regex(/[A-Z]/, { message: "errors.passwordUppercase" })
  .regex(/[a-z]/, { message: "errors.passwordLowercase" })
  .regex(/[0-9]/, { message: "errors.passwordNumber" })
  .regex(/[!@#$%^&*(),.?":{}|<>\-_+=~`[\]\\;]/, {
    message: "errors.passwordSpecial",
  });

export const settingsSchema = z
  .object({
    name: z.string().nonempty({ message: "errors.required" }),
    surName: z.string().nonempty({ message: "errors.required" }),
    email: z.string(),
    emailConfirmation: z.string(),
    password: z.string(),
    passwordConfirmation: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.email || data.emailConfirmation) {
      if (!data.email) {
        ctx.addIssue({ code: "custom", message: "errors.required", path: ["email"] });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        ctx.addIssue({ code: "custom", message: "errors.invalidEmail", path: ["email"] });
      }
      if (!data.emailConfirmation) {
        ctx.addIssue({ code: "custom", message: "errors.required", path: ["emailConfirmation"] });
      } else if (data.email && data.email !== data.emailConfirmation) {
        ctx.addIssue({ code: "custom", message: "errors.emailsMismatch", path: ["emailConfirmation"] });
      }
    }

    if (data.password || data.passwordConfirmation) {
      if (!data.password) {
        ctx.addIssue({ code: "custom", message: "errors.required", path: ["password"] });
      } else {
        const result = passwordRules.safeParse(data.password);
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            ctx.addIssue({ code: "custom", message: issue.message, path: ["password"] });
          });
        }
      }
      if (!data.passwordConfirmation) {
        ctx.addIssue({ code: "custom", message: "errors.required", path: ["passwordConfirmation"] });
      } else if (data.password && data.password !== data.passwordConfirmation) {
        ctx.addIssue({ code: "custom", message: "errors.passwordsMismatch", path: ["passwordConfirmation"] });
      }
    }
  });

export type LoginPayload = z.infer<typeof loginSchema>;
export type SettingsPayload = z.infer<typeof settingsSchema>;
