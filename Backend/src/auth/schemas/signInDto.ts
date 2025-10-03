import { z } from 'zod';

export const signInDto = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
}).required();

export type SignInUserDto = z.infer<typeof signInDto>;