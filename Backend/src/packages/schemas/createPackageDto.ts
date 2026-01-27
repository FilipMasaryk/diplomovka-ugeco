import { z } from 'zod';
import { PackageType } from './packageSchema';

export const CreatePackageDto = z
  .object({
    name: z.string().min(1, 'Name is required'),
    validityMonths: z.number().int().positive(),
    offersCount: z.number().int().nonnegative().optional(),
    type: z.enum([PackageType.CREATOR, PackageType.BRAND]),
  })
  .refine(
    (data) => {
      if (data.type === PackageType.BRAND) {
        return data.offersCount !== undefined;
      }
      return true;
    },
    {
      message: 'offersCount is required for BRAND packages',
      path: ['offersCount'],
    },
  );

export type CreatePackageDto = z.infer<typeof CreatePackageDto>;
