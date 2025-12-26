import { z } from 'zod';
import { PackageType } from './packageSchema';

export const UpdatePackageDto = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  validityMonths: z.number().int().positive().optional(),
  offersCount: z.number().int().nonnegative().optional(),
  //type: z.enum([PackageType.CREATOR, PackageType.BRAND]).optional(),
});

export type UpdatePackageDto = z.infer<typeof UpdatePackageDto>;
