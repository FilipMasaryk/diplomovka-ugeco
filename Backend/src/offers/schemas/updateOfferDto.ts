import { z } from 'zod';
import { OfferTarget } from '../../common/enums/offerTargetEnum';
import { Country } from 'src/common/enums/countryEnum';
import { BrandCategory } from 'src/common/enums/brandCategoriesEnum';

export const updateOfferSchema = z
  .object({
    title: z.string().min(1).optional(),

    categories: z.array(z.enum(BrandCategory)).optional(),

    activeFrom: z.preprocess(
      (arg) => (arg ? new Date(arg as string) : undefined),
      z.date().optional(),
    ),

    activeTo: z.preprocess(
      (arg) => (arg ? new Date(arg as string) : undefined),
      z.date().optional(),
    ),

    image: z.string().optional(),

    languages: z.array(z.enum(Country)).optional(),

    targets: z.array(z.enum(OfferTarget)).optional(),

    description: z.string().optional(),

    website: z.string().url().optional(),
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    tiktok: z.string().url().optional(),
    pinterest: z.string().url().optional(),
  })
  .refine(
    (data) =>
      !data.activeFrom || !data.activeTo || data.activeFrom < data.activeTo,
    {
      message: 'activeFrom must be before activeTo',
      path: ['activeTo'],
    },
  );

export type UpdateOfferDto = z.infer<typeof updateOfferSchema>;
