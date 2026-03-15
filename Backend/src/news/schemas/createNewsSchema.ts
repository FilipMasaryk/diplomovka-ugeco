import { z } from 'zod';
import { NewsCategory } from 'src/common/enums/newsCategoryEnum';
import { NewsTarget } from 'src/common/enums/newsTargetEnum';
import { NewsStatus } from 'src/common/enums/newsStatusEnum';

export const createNewsSchema = z.object({
  title: z.string().optional().default(''),
  description: z.string().max(2000).optional().default(''),
  category: z
    .enum([NewsCategory.FIX, NewsCategory.FEATURE, NewsCategory.BUG])
    .optional(),
  target: z.enum([
    NewsTarget.ALL,
    NewsTarget.BRAND_MANAGER,
    NewsTarget.CREATOR,
  ]),
  status: z
    .enum([NewsStatus.DRAFT, NewsStatus.PUBLISHED])
    .default(NewsStatus.DRAFT),
});

export type CreateNewsDto = z.infer<typeof createNewsSchema>;
