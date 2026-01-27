import { z } from 'zod';
import { OfferTarget } from '../../common/enums/offerTargetEnum';
import { Country } from 'src/common/enums/countryEnum';
import { BrandCategory } from 'src/common/enums/brandCategoriesEnum';

export const updateOfferSchema = z
  .object({
    paidCooperation: z
      .preprocess((arg) => arg === 'true', z.boolean())
      .optional(),

    name: z.string().min(1).optional(),

    categories: z
      .preprocess(
        (val) => {
          if (val === undefined) return undefined;
          return Array.isArray(val) ? val : [val];
        },
        z.array(z.enum(BrandCategory)).min(1),
      )
      .optional(),

    activeFrom: z.preprocess(
      (arg) => (arg ? new Date(arg as string) : undefined),
      z.date().optional(),
    ),

    activeTo: z.preprocess(
      (arg) => (arg ? new Date(arg as string) : undefined),
      z.date().optional(),
    ),

    image: z.string().optional(),

    languages: z
      .preprocess(
        (val) => {
          if (val === undefined) return undefined;
          return Array.isArray(val) ? val : [val];
        },
        z.array(z.enum(Country)).min(1),
      )
      .optional(),

    targets: z
      .preprocess(
        (val) => {
          if (val === undefined) return undefined;
          return Array.isArray(val) ? val : [val];
        },
        z.array(z.enum(OfferTarget)).min(1),
      )
      .optional(),

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
