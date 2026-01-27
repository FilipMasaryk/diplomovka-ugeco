import { z } from 'zod';
import { Country } from '../../common/enums/countryEnum';
import { BrandCategory } from '../../common/enums/brandCategoriesEnum';
import { OfferTarget } from '../../common/enums/offerTargetEnum';

export const createUserProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),

  languages: z.preprocess(
    (val) => {
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    },
    z.array(z.enum(Country)).min(1, 'At least one language is required'),
  ),

  categories: z.preprocess(
    (val) => {
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    },
    z.array(z.enum(BrandCategory)).min(1, 'At least one category is required'),
  ),

  creatingAs: z.preprocess(
    (val) => {
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    },
    z.array(z.enum(OfferTarget)).min(1, 'At least one creatingAs is required'),
  ),

  about: z.string().min(1, 'About is required'),
  portfolio: z.string().url('Portfolio must be a valid URL'),
  image: z.string().min(1, 'Image is required'),

  facebook: z.string().url('Facebook link must be a valid URL').optional(),
  instagram: z.string().url('Instagram link must be a valid URL').optional(),
  tiktok: z.string().url('TikTok link must be a valid URL').optional(),
  pinterest: z.string().url('Pinterest link must be a valid URL').optional(),
  youtube: z.string().url('YouTube link must be a valid URL').optional(),

  published: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()),
});

export type CreateUserProfileDto = z.infer<typeof createUserProfileSchema>;
