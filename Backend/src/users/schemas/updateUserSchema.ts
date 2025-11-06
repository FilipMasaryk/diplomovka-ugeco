import { z } from 'zod';
import { UserRole } from './userSchema';

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  surName: z.string().min(1, 'Surname is required').optional(),
  email: z.email('Invalid email').optional(),
  role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
