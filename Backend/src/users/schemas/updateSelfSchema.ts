import { z } from 'zod';
import { passwordSchema } from '../../auth/schemas/passwordSchema';

export const updateSelfSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    surName: z.string().min(1, 'Surname is required').optional(),
    ico: z.string().optional(),
    dic: z.string().optional(),

    password: passwordSchema.optional(),
    passwordConfirmation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password || data.passwordConfirmation) {
      if (!data.password || !data.passwordConfirmation) {
        ctx.addIssue({
          code: 'custom',
          path: ['passwordConfirmation'],
          message: 'Password confirmation is required',
        });
      } else if (data.password !== data.passwordConfirmation) {
        ctx.addIssue({
          code: 'custom',
          path: ['passwordConfirmation'],
          message: 'Passwords do not match',
        });
      }
    }
  });

export type UpdateSelfDto = z.infer<typeof updateSelfSchema>;
