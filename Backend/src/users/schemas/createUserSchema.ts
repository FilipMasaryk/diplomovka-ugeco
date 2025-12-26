import { z } from 'zod';
import { UserRole } from './userSchema';
import { Country } from './countryEnum';

export const createUserSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    surName: z.string().min(1, 'surName is required'),
    email: z.email('Invalid email'),
    //password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(UserRole).default(UserRole.CREATOR),
    package: z.string().optional(),
    ico: z.string().optional(),
    purchasedAt: z.preprocess(
      (arg) => (arg ? new Date(arg as string) : undefined),
      z.date().optional(),
    ),
    //opravit ked bude implementovana znacka
    brands: z.array(z.string()).optional(),
    countries: z.array(z.enum(Country)).optional(),
  })
  .superRefine((data, ctx) => {
    switch (data.role) {
      case UserRole.CREATOR:
        if (!data.package) {
          ctx.addIssue({
            code: 'custom',
            path: ['package'],
            message: 'Package is required for creators',
          });
        }
        if (!data.purchasedAt) {
          ctx.addIssue({
            code: 'custom',
            path: ['purchasedAt'],
            message: 'Purchase date is required for creators',
          });
        }
        if (!data.countries || data.countries.length === 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['countries'],
            message: 'At least one country is required for creators',
          });
        }
        break;

      case UserRole.BRAND_MANAGER:
        if (!data.brands || data.brands.length === 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['brands'],
            message: 'At least one brand is required for Brand Manager',
          });
        }
        if (!data.countries || data.countries.length === 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['countries'],
            message: 'At least one country is required for Brand Manager',
          });
        }
        break;

      case UserRole.SUBADMIN:
        if (!data.countries || data.countries.length === 0) {
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

export type CreateUserDto = z.infer<typeof createUserSchema>;
