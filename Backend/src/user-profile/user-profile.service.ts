import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserProfile, UserProfileDocument } from './schemas/userProfileSchema';
import { CreateUserProfileDto } from './schemas/createUserProfileSchema';
import type { Multer } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { User } from 'src/users/schemas/userSchema';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectModel(UserProfile.name)
    private profileModel: Model<UserProfileDocument>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(
    userId: string,
    dto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    if (!Types.ObjectId.isValid(userId))
      throw new BadRequestException('Invalid user ID');

    const userObjectId = new Types.ObjectId(userId);
    const existingProfile = await this.profileModel.findOne({
      user: userObjectId,
    });
    if (existingProfile)
      throw new BadRequestException('Profile already exists');

    const profile = new this.profileModel({
      ...dto,
      user: new Types.ObjectId(userId),
    });

    await profile.save();
    await this.userModel.findByIdAndUpdate(userId, { profile: profile._id });
    return profile;
  }

  async updateProfile(
    userId: string,
    dto: Partial<CreateUserProfileDto>,
    file?: Multer.File,
  ): Promise<UserProfile> {
    const profile = await this.profileModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const oldImage = profile.image;

    if (file) {
      dto.image = `/uploads/profiles/${file.filename}`;
    }

    Object.assign(profile, dto);
    const updatedProfile = await profile.save();
    if (file && oldImage && oldImage !== dto.image) {
      const oldImagePath = path.join(process.cwd(), 'src', oldImage);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    return updatedProfile;
  }

  async findByUser(userId: string): Promise<UserProfile> {
    const userObjectId = new Types.ObjectId(userId);
    const profile = await this.profileModel.findOne({ user: userObjectId });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }
}
