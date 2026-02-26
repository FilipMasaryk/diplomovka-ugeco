import { z } from 'zod';
import { OfferTarget } from '../../common/enums/offerTargetEnum';
import { Language } from 'src/common/enums/languageEnum';
import { BrandCategory } from 'src/common/enums/brandCategoriesEnum';
import { OfferStatus } from './offerSchema';

const urlField = z.preprocess(
  (val) => {
    if (typeof val === 'string' && val && !val.match(/^https?:\/\//)) {
      return `https://${val}`;
    }
    return val;
  },
  z.string().url().optional().or(z.literal('')),
);

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
          const arr = Array.isArray(val) ? val : [val];
          return arr.map((v: unknown) =>
            typeof v === 'string' ? v.toLowerCase() : v,
          );
        },
        z.array(z.enum(Language)).min(1),
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

    website: urlField,
    facebook: urlField,
    instagram: urlField,
    tiktok: urlField,
    pinterest: urlField,

    contact: z.string().optional().or(z.literal('')),

    status: z.nativeEnum(OfferStatus).optional(),
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
