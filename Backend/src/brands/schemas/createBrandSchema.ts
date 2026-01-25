import { z } from 'zod';
import { Country } from '../../common/enums/countryEnum';
import { BrandCategory } from '../../common/enums/brandCategoriesEnum';

export const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),

  ico: z.string().optional(),

  address: z.string().min(1, 'Address is required'),

  city: z.string().min(1, 'City is required'),

  zip: z.string().min(1, 'ZIP code is required'),

  country: z.enum(Country),

  categories: z
    .array(z.enum(BrandCategory))
    .min(1, 'At least one category is required'),

  package: z.string().min(1, 'Package is required'),

  mainContact: z.string().optional(),
});

export type CreateBrandDto = z.infer<typeof createBrandSchema>;
