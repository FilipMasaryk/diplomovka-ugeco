import { z } from 'zod';
import { UserRole } from '../../common/enums/userRoleEnum';
import { Country } from '../../common/enums/countryEnum';

export const updateUserSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    surName: z.string().min(1, 'Surname is required').optional(),
    email: z.email('Invalid email').optional(),
    role: z.enum(UserRole).optional(),
    package: z.string().optional(),
    ico: z.string().optional(),
    purchasedAt: z.preprocess(
      (arg) => (arg ? new Date(arg as string) : undefined),
      z.date().optional(),
    ),
    brands: z.array(z.string()).optional(),
    countries: z.array(z.enum(Country)).optional(),
  })
  .superRefine((data, ctx) => {
    switch (data.role) {
      case UserRole.CREATOR:
        if ('package' in data && !data.package) {
          ctx.addIssue({
            code: 'custom',
            path: ['package'],
            message: 'Package is required for creators',
          });
        }
        if ('purchasedAt' in data && !data.purchasedAt) {
          ctx.addIssue({
            code: 'custom',
            path: ['purchasedAt'],
            message: 'Purchase date is required for creators',
          });
        }
        if (
          'countries' in data &&
          (!data.countries || data.countries.length === 0)
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['countries'],
            message: 'At least one country is required for creators',
          });
        }
        break;

      case UserRole.BRAND_MANAGER:
        if ('brands' in data && (!data.brands || data.brands.length === 0)) {
          ctx.addIssue({
            code: 'custom',
            path: ['brands'],
            message: 'At least one brand is required for Brand Manager',
          });
        }
        if (
          'countries' in data &&
          (!data.countries || data.countries.length === 0)
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['countries'],
            message: 'At least one country is required for Brand Manager',
          });
        }
        break;

      case UserRole.SUBADMIN:
        if (
          'countries' in data &&
          (!data.countries || data.countries.length === 0)
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['countries'],
            message: 'At least one country is required for SubAdmin',
          });
        }
        break;

      case UserRole.ADMIN:
        break;
    }
  });

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
