import { z } from 'zod';
import { NewsCategory } from 'src/common/enums/newsCategoryEnum';
import { NewsTarget } from 'src/common/enums/newsTargetEnum';
import { NewsStatus } from 'src/common/enums/newsStatusEnum';

export const updateNewsSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).max(2000).optional(),
  category: z.enum([NewsCategory.FIX, NewsCategory.FEATURE, NewsCategory.BUG]).optional(),
  target: z.enum([NewsTarget.ALL, NewsTarget.BRAND_MANAGER, NewsTarget.CREATOR]).optional(),
  status: z.enum([NewsStatus.DRAFT, NewsStatus.PUBLISHED]).optional(),
});

export type UpdateNewsDto = z.infer<typeof updateNewsSchema>;
