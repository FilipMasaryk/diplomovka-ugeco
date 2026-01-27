import { z } from 'zod';
import { passwordSchema } from '../../auth/schemas/passwordSchema';

export const updateSelfSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    surName: z.string().min(1, 'Surname is required').optional(),
    ico: z.string().optional(),

    email: z.string().email('Invalid email').optional(),
    emailConfirmation: z.string().email('Invalid email').optional(),

    password: passwordSchema.optional(),
    passwordConfirmation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.email || data.emailConfirmation) {
      if (!data.email || !data.emailConfirmation) {
        ctx.addIssue({
          code: 'custom',
          path: ['emailConfirmation'],
          message: 'Email confirmation is required',
        });
      } else if (data.email !== data.emailConfirmation) {
        ctx.addIssue({
          code: 'custom',
          path: ['emailConfirmation'],
          message: 'Emails do not match',
        });
      }
    }

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
