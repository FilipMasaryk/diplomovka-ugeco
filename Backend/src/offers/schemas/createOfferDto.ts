import { z } from 'zod';
import { OfferTarget } from '../../common/enums/offerTargetEnum';
import { BrandCategory } from 'src/common/enums/brandCategoriesEnum';
import { Language } from 'src/common/enums/languageEnum';
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

export const createOfferSchema = z
  .object({
    paidCooperation: z.preprocess((arg) => arg === 'true', z.boolean()),

    name: z.string().min(1, 'Offer name is required'),

    categories: z.preprocess(
      (val) => {
        if (!val) return [];
        return Array.isArray(val) ? val : [val];
      },
      z.array(z.enum(BrandCategory)).default([]),
    ),

    activeFrom: z.preprocess(
      (arg) => (arg ? new Date(arg as string) : undefined),
      z.date().optional(),
    ),

    activeTo: z.preprocess(
      (arg) => (arg ? new Date(arg as string) : undefined),
      z.date().optional(),
    ),

    image: z.string().optional(),

    languages: z.preprocess(
      (val) => {
        if (!val) return [];
        const arr = Array.isArray(val) ? val : [val];
        return arr.map((v: unknown) =>
          typeof v === 'string' ? v.toLowerCase() : v,
        );
      },
      z.array(z.enum(Language)).default([]),
    ),

    targets: z.preprocess(
      (val) => {
        if (!val) return [];
        return Array.isArray(val) ? val : [val];
      },
      z.array(z.enum(OfferTarget)).default([]),
    ),

    description: z.string().optional().default(''),

    website: urlField,
    facebook: urlField,
    instagram: urlField,
    tiktok: urlField,
    pinterest: urlField,

    contact: z.string().optional().or(z.literal('')),

    brand: z.string().min(1, 'Brand is required'),

    status: z.nativeEnum(OfferStatus).optional().default(OfferStatus.ACTIVE),
  })
  .refine(
    (data) =>
      !data.activeFrom || !data.activeTo || data.activeFrom < data.activeTo,
    {
      message: 'activeFrom must be before activeTo',
      path: ['activeTo'],
    },
  )
  .refine(
    (data) =>
      data.status === OfferStatus.CONCEPT ||
      (data.image && data.image.length > 0),
    {
      message: 'Image is required for active offers',
      path: ['image'],
    },
  )
  .refine(
    (data) =>
      data.status === OfferStatus.CONCEPT || data.categories.length > 0,
    {
      message: 'At least one category is required',
      path: ['categories'],
    },
  )
  .refine(
    (data) =>
      data.status === OfferStatus.CONCEPT || data.languages.length > 0,
    {
      message: 'At least one language is required',
      path: ['languages'],
    },
  )
  .refine(
    (data) =>
      data.status === OfferStatus.CONCEPT || data.targets.length > 0,
    {
      message: 'At least one target is required',
      path: ['targets'],
    },
  )
  .refine(
    (data) =>
      data.status === OfferStatus.CONCEPT ||
      (data.description && data.description.length > 0),
    {
      message: 'Description is required',
      path: ['description'],
    },
  );

export type CreateOfferDto = z.infer<typeof createOfferSchema>;
