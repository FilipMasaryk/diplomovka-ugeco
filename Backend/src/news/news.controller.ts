import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/userRoleEnum';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  createNewsSchema,
  type CreateNewsDto,
} from './schemas/createNewsSchema';
import {
  updateNewsSchema,
  type UpdateNewsDto,
} from './schemas/updateNewsSchema';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import type { Multer } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import path from 'path';
import { diskStorage } from 'multer';
import fs from 'fs';

const newsImageStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'src', 'uploads', 'news');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: newsImageStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  create(
    @Body(new ZodValidationPipe(createNewsSchema)) dto: CreateNewsDto,
    @UploadedFile() file?: Multer.File,
  ) {
    const imagePath = file ? `/uploads/news/${file.filename}` : undefined;
    return this.newsService.create(dto, imagePath);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  @Get()
  findAll(@Query('target') target?: string) {
    if (target) return this.newsService.findByTarget(target);
    return this.newsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('published')
  findPublished(@Req() req) {
    return this.newsService.findPublishedForRole(req.user.role);
  }

  @UseGuards(AuthGuard)
  @Get('unread-count')
  async getUnreadCount(@Req() req) {
    const user = await this.newsService['userModel'].findById(req.user.id);
    const lastSeen = user?.lastSeenNewsAt || new Date(0);
    const count = await this.newsService.countUnreadForRole(
      req.user.role,
      lastSeen,
    );
    return { count };
  }

  @UseGuards(AuthGuard)
  @Get('recent')
  findRecent(@Req() req) {
    return this.newsService.findRecentForRole(req.user.role, 5);
  }

  @UseGuards(AuthGuard)
  @Post('mark-seen')
  markSeen(@Req() req) {
    return this.newsService.markSeen(req.user.id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: newsImageStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateNewsSchema)) dto: UpdateNewsDto,
    @UploadedFile() file?: Multer.File,
  ) {
    const imagePath = file ? `/uploads/news/${file.filename}` : undefined;
    return this.newsService.update(id, dto, imagePath);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}
