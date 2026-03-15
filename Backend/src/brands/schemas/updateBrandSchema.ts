import { z } from 'zod';
import { Country } from '../../common/enums/countryEnum';
import { BrandCategory } from '../../common/enums/brandCategoriesEnum';

const urlField = z.preprocess(
  (val) => {
    if (typeof val === 'string' && val && !val.match(/^https?:\/\//)) {
      return `https://${val}`;
    }
    return val;
  },
  z.string().url().optional().or(z.literal('')),
);

export const updateBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').optional(),

  ico: z.string().optional(),

  dic: z.string().optional(),

  address: z.string().min(1, 'Address is required').optional(),

  city: z.string().min(1, 'City is required').optional(),

  zip: z.string().min(1, 'ZIP code is required').optional(),

  country: z.enum(Country).optional(),

  categories: z.preprocess(
    (val) => {
      if (!val) return undefined;
      return Array.isArray(val) ? val : [val];
    },
    z
      .array(z.enum(BrandCategory))
      .min(1, 'At least one category is required')
      .optional(),
  ),

  package: z.string().nullable().optional(),

  mainContact: z.string().nullable().optional(),

  logo: z.string().url('Logo must be a valid URL').optional(),
  website: urlField,
  facebook: urlField,
  instagram: urlField,
  tiktok: urlField,
  pinterest: urlField,
  youtube: urlField,
});

export type UpdateBrandDto = z.infer<typeof updateBrandSchema>;
