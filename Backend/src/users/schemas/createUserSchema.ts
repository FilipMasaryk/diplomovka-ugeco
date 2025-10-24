import { z } from 'zod';
import { UserRole } from './userSchema';

export const createUserSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z
      .enum(Object.values(UserRole) as [string, ...string[]])
      .default(UserRole.CREATOR),
  })
  .required();

export type CreateUserDto = z.infer<typeof createUserSchema>;
