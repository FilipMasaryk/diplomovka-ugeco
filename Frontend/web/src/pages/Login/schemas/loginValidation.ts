import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "Povinné pole" }) // najprv kontrola prázdneho poľa
    .email({ message: "Neplatný email" }), // potom formát emailu
  password: z.string().nonempty({ message: "Povinné pole" }),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "Povinné pole" })
    .email({ message: "Neplatný email" }),
});
