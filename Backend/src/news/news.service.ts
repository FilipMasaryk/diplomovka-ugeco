import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News } from './schemas/newsSchema';
import { User } from 'src/users/schemas/userSchema';
import { CreateNewsDto } from './schemas/createNewsSchema';
import { UpdateNewsDto } from './schemas/updateNewsSchema';
import path from 'path';
import fs from 'fs';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name)
    private readonly newsModel: Model<News>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(dto: CreateNewsDto, imagePath?: string): Promise<News> {
    const data: Record<string, unknown> = { ...dto };
    if (imagePath) data.image = imagePath;
    if (dto.status === 'published') data.publishedAt = new Date();
    const news = new this.newsModel(data);
    return news.save();
  }

  async findAll(): Promise<News[]> {
    return this.newsModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByTarget(target: string): Promise<News[]> {
    return this.newsModel
      .find({ target })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPublishedForRole(role: string): Promise<News[]> {
    return this.newsModel
      .find({
        status: 'published',
        target: { $in: [role, 'all'] },
      })
      .sort({ publishedAt: -1 })
      .exec();
  }

  async countUnreadForRole(
    role: string,
    lastSeenAt: Date | undefined,
  ): Promise<number> {
    const since = lastSeenAt || new Date(0);
    return this.newsModel
      .countDocuments({
        status: 'published',
        target: { $in: [role, 'all'] },
        publishedAt: { $gt: since },
      })
      .exec();
  }

  async findRecentForRole(role: string, limit = 5): Promise<News[]> {
    return this.newsModel
      .find({
        status: 'published',
        target: { $in: [role, 'all'] },
      })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<News> {
    const news = await this.newsModel.findById(id);
    if (!news) throw new NotFoundException('News not found');
    return news;
  }

  async update(
    id: string,
    dto: UpdateNewsDto,
    imagePath?: string,
  ): Promise<News> {
    const news = await this.newsModel.findById(id);
    if (!news) throw new NotFoundException('News not found');

    if (imagePath) {
      // Delete old image if exists
      if (news.image) {
        const oldPath = path.join(process.cwd(), 'src', news.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      news.image = imagePath;
    }

    Object.assign(news, dto);
    if (dto.status === 'published' && !news.publishedAt) {
      news.publishedAt = new Date();
    }
    return news.save();
  }

  async remove(id: string): Promise<void> {
    const news = await this.newsModel.findById(id);
    if (!news) throw new NotFoundException('News not found');

    // Delete image file if exists
    if (news.image) {
      const imgPath = path.join(process.cwd(), 'src', news.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await this.newsModel.findByIdAndDelete(id);
  }

  async markSeen(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      lastSeenNewsAt: new Date(),
    });
  }
}
