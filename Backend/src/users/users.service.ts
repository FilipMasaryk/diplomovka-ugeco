import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './schemas/userSchema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  createUserSchema,
  CreateUserDto,
} from 'src/users/schemas/createUserSchema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';
import { UpdateUserDto } from './schemas/updateUserSchema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) throw new BadRequestException('Email already in use');

    const initToken = crypto.randomBytes(32).toString('hex');
    const hashedInitToken = crypto
      .createHash('sha256')
      .update(initToken)
      .digest('hex');

    const createdUser = new this.userModel({
      ...createUserDto,
      password: '',
      initToken: hashedInitToken,
      initTokenExpires: new Date(Date.now() + 1000 * 60 * 60), // platnost 1 hodina
    });

    await createdUser.save();

    // poslanie emailu s odkazom
    await this.emailService.sendInitEmail(createdUser.email, initToken);

    return createdUser;
  }

  async createPasswordResetToken(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    //PLatnost tokenu 10 min
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 10);
    await user.save();

    await this.emailService.sendResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userModel.findOne({
      resetPasswordToken: hashedToken,
      // pozre ci reset token neni expired
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
  }

  async initializePassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userModel.findOne({
      initToken: hashedToken,
      initTokenExpires: { $gt: new Date() },
    });

    if (!user) throw new BadRequestException('Invalid or expired token');

    user.password = await bcrypt.hash(newPassword, 10);
    user.initToken = undefined;
    user.initTokenExpires = undefined;

    await user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email) {
      const emailExists = await this.userModel.findOne({
        email: updateUserDto.email,
        _id: { $ne: id },
      });
      if (emailExists) {
        throw new BadRequestException('Email already in use');
      }
    }

    Object.assign(user, updateUserDto);

    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword as User;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      message: `User ${deletedUser.email} has been deleted successfully.`,
    };
  }
}
