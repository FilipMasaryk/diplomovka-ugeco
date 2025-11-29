import { z } from 'zod';
import { UserRole } from './userSchema';

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  surName: z.string().min(1, 'Surname is required').optional(),
  email: z.email('Invalid email').optional(),
  role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),

  package: z.string().optional(),
  ico: z.string().optional(),
  purchasedAt: z.preprocess(
    (arg) => (arg ? new Date(arg as string) : undefined),
    z.date().optional(),
  ),
  brands: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
