import { z } from 'zod';
import { OfferTarget } from '../../common/enums/offerTargetEnum';
import { BrandCategory } from 'src/common/enums/brandCategoriesEnum';
import { Country } from 'src/common/enums/countryEnum';

export const createOfferSchema = z
  .object({
    paidCooperation: z.preprocess((arg) => arg === 'true', z.boolean()),

    name: z.string().min(1, 'Offer name is required'),

    categories: z.preprocess(
      (val) => {
        if (!val) return [];
        return Array.isArray(val) ? val : [val];
      },
      z
        .array(z.enum(BrandCategory))
        .min(1, 'At least one category is required'),
    ),

    activeFrom: z.preprocess((arg) => new Date(arg as string), z.date()),

    activeTo: z.preprocess((arg) => new Date(arg as string), z.date()),

    image: z.string().min(1, 'Image is required'),

    //pretoze ked cez form-data posielame len jeden jazyk, tak to zod neberie ako pole
    languages: z.preprocess(
      (val) => {
        if (!val) return [];
        return Array.isArray(val) ? val : [val];
      },
      z.array(z.enum(Country)).min(1, 'At least one language is required'),
    ),

    targets: z.preprocess(
      (val) => {
        if (!val) return [];
        return Array.isArray(val) ? val : [val];
      },
      z.array(z.enum(OfferTarget)).min(1, 'At least one target is required'),
    ),

    description: z.string().min(1, 'Description is required'),

    website: z.string().url().optional(),
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    tiktok: z.string().url().optional(),
    pinterest: z.string().url().optional(),

    brand: z.string().min(1, 'Brand is required'),
  })
  .refine((data) => data.activeFrom < data.activeTo, {
    message: 'activeFrom must be before activeTo',
    path: ['activeTo'],
  });

export type CreateOfferDto = z.infer<typeof createOfferSchema>;
