import { z } from 'zod';
import { Country } from '../../common/enums/countryEnum';
import { BrandCategory } from '../../common/enums/brandCategoriesEnum';
import { OfferTarget } from '../../common/enums/offerTargetEnum';

const urlField = z.preprocess(
  (val) => {
    if (typeof val === 'string' && val && !val.match(/^https?:\/\//)) {
      return `https://${val}`;
    }
    return val;
  },
  z.string().url().optional().or(z.literal('')),
);

const arrayPreprocess = (val: unknown) => {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

export const createUserProfileSchema = z.object({
  name: z.string().optional().default(''),

  languages: z.preprocess(
    arrayPreprocess,
    z.array(z.enum(Country)).default([]),
  ),

  categories: z.preprocess(
    arrayPreprocess,
    z.array(z.enum(BrandCategory)).default([]),
  ),

  creatingAs: z.preprocess(
    arrayPreprocess,
    z.array(z.enum(OfferTarget)).default([]),
  ),

  about: z.string().optional().default(''),
  portfolio: urlField,
  image: z.string().optional().default(''),

  facebook: urlField,
  instagram: urlField,
  tiktok: urlField,
  pinterest: urlField,
  youtube: urlField,

  published: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()),
});

export type CreateUserProfileDto = z.infer<typeof createUserProfileSchema>;

export function validateForPublish(dto: CreateUserProfileDto): string[] {
  const errors: string[] = [];
  if (!dto.name || !dto.name.trim()) errors.push('Name is required');
  if (!dto.languages || dto.languages.length === 0)
    errors.push('At least one language is required');
  if (!dto.categories || dto.categories.length === 0)
    errors.push('At least one category is required');
  if (!dto.creatingAs || dto.creatingAs.length === 0)
    errors.push('At least one creatingAs is required');
  if (!dto.about || !dto.about.trim()) errors.push('About is required');
  if (!dto.portfolio || !dto.portfolio.trim())
    errors.push('Portfolio is required');
  if (!dto.image || !dto.image.trim()) errors.push('Image is required');
  return errors;
}
