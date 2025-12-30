import { z } from 'zod';
import { Country } from '../../common/enums/countryEnum';
import { BrandCategory } from '../../common/enums/brandCategories';

export const updateBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').optional(),

  ico: z.string().optional(),

  address: z.string().min(1, 'Address is required').optional(),

  city: z.string().min(1, 'City is required').optional(),

  zip: z.string().min(1, 'ZIP code is required').optional(),

  country: z.enum(Country).optional(),

  categories: z
    .array(z.enum(BrandCategory))
    .min(1, 'At least one category is required')
    .optional(),

  package: z.string().optional(),

  mainContact: z.string().optional(),
});

export type UpdateBrandDto = z.infer<typeof updateBrandSchema>;
