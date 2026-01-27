import { z } from 'zod';
import { Country } from '../../common/enums/countryEnum';
import { BrandCategory } from '../../common/enums/brandCategoriesEnum';

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

  package: z.string().nullable().optional(),

  mainContact: z.string().optional(),

  logo: z.string().url('Logo must be a valid URL').optional(),
  website: z.string().url('Website must be a valid URL').optional(),
  facebook: z.string().url('Facebook link must be a valid URL').optional(),
  instagram: z.string().url('Instagram link must be a valid URL').optional(),
  tiktok: z.string().url('TikTok link must be a valid URL').optional(),
  pinterest: z.string().url('Pinterest link must be a valid URL').optional(),
  youtube: z.string().url('YouTube link must be a valid URL').optional(),
});

export type UpdateBrandDto = z.infer<typeof updateBrandSchema>;
