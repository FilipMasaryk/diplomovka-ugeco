import { z } from 'zod';
import { Country } from '../../common/enums/countryEnum';
import { BrandCategory } from 'src/common/enums/brandCategoriesEnum';
import { OfferTarget } from 'src/common/enums/offerTargetEnum';

export const updateCreatorSchema = z.object({
  name: z.string().min(1).optional(),
  surName: z.string().min(1).optional(),
  countries: z.array(z.enum(Country)).optional(),
  categories: z.array(z.enum(BrandCategory)).optional(),
  creatingWith: z.array(z.enum(OfferTarget)).optional(),
  portfolio: z.string().optional(),
  instagram: z.string().optional(),
  pinterest: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
  image: z.string().optional(),
  about: z.string().optional(),
});

export type UpdateCreatorDto = z.infer<typeof updateCreatorSchema>;
