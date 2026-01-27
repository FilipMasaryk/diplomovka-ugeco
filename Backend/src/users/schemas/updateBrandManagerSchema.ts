import { passwordSchema } from 'src/auth/schemas/passwordSchema';
import { z } from 'zod';

export const updateBrandManagerSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  surName: z.string().min(1, 'Surname is required').optional(),
});

export type UpdateBrandManagerDto = z.infer<typeof updateBrandManagerSchema>;
