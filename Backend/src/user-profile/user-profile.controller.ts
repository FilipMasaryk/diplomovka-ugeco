import {
  Controller,
  Post,
  Patch,
  Body,
  Req,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import {
  type CreateUserProfileDto,
  createUserProfileSchema,
} from './schemas/createUserProfileSchema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { AuthGuard } from '../auth/auth.guard';
import type { Multer } from 'multer';
const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'src/uploads/profiles');
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

@Controller('profiles')
export class UserProfileController {
  constructor(private readonly profilesService: UserProfileService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage }))
  async createProfile(
    @Req() req,
    @Body() body: any,
    @UploadedFile() file: Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    body.image = `/uploads/profiles/${file.filename}`;

    try {
      const dto: CreateUserProfileDto = createUserProfileSchema.parse(body);
      return await this.profilesService.create(req.user.id, dto);
    } catch (err) {
      fs.unlinkSync(file.path);
      throw err;
    }
  }

  @Patch()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage }))
  async updateProfile(
    @Req() req,
    @Body() body: any,
    @UploadedFile() file: Multer.File,
  ) {
    const dto = createUserProfileSchema.partial().parse(body);
    return this.profilesService.updateProfile(req.user.id, dto, file);
  }
  @UseGuards(AuthGuard)
  @Get('me')
  async getMyProfile(@Req() req) {
    return this.profilesService.findByUser(req.user.id);
  }
}
