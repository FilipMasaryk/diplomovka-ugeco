import { z } from 'zod';
import { passwordSchema } from 'src/auth/schemas/passwordSchema';

export const resetAndInitializeDto = z
  .object({
    password: passwordSchema,
    passwordConfirm: passwordSchema,
  })
  .required();

export type ResetAndInitializeDto = z.infer<typeof resetAndInitializeDto>;
