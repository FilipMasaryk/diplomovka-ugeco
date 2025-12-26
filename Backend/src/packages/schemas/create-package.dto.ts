import { z } from 'zod';
import { PackageType } from './packageSchema';

export const CreatePackageDto = z.object({
  name: z.string().min(1, 'Name is required'),
  validityMonths: z.number().int().positive(),
  offersCount: z.number().int().nonnegative(),
  type: z.enum([PackageType.CREATOR, PackageType.BRAND]),
});

export type CreatePackageDto = z.infer<typeof CreatePackageDto>;
