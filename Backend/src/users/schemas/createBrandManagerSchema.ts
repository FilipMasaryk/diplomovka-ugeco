import { passwordSchema } from 'src/auth/schemas/passwordSchema';
import { z } from 'zod';

export const createBrandManagerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  surName: z.string().min(1, 'Surname is required'),
  email: z.email('Invalid email'),
  password: passwordSchema,
});

export type CreateBrandManagerDto = z.infer<typeof createBrandManagerSchema>;
