import { z } from 'zod';
import { passwordSchema } from 'src/auth/schemas/passwordSchema';

export const signInDto = z
  .object({
    email: z.email('Invalid email'),
    password: z.string().nonempty('Password is required'),
    rememberMe: z.boolean().optional(),
  })
  .required();

export type SignInUserDto = z.infer<typeof signInDto>;
