import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { User } from './schemas/userSchema';
import { UserRole } from '../common/enums/userRoleEnum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersSeederService implements OnModuleInit {
  private readonly logger = new Logger(UsersSeederService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const count = await this.userModel.countDocuments();
    if (count > 0) return;

    this.logger.log('No users found — seeding default admin accounts…');

    let seeded = 0;

    for (let i = 1; i <= 10; i++) {
      const email = this.configService.get<string>(`SEED_ADMIN_${i}_EMAIL`);
      const password = this.configService.get<string>(
        `SEED_ADMIN_${i}_PASSWORD`,
      );
      const name = this.configService.get<string>(`SEED_ADMIN_${i}_NAME`);
      const surName = this.configService.get<string>(`SEED_ADMIN_${i}_SURNAME`);

      if (!email) break;

      if (!password || !name || !surName) {
        this.logger.warn(`Skipping SEED_ADMIN_${i}: missing fields`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await this.userModel.create({
        name,
        surName,
        email,
        password: hashedPassword,
        role: UserRole.ADMIN,
      });
      this.logger.log(`Created admin: ${email}`);
      seeded++;
    }

    if (seeded === 0) {
      this.logger.warn(
        'No SEED_ADMIN env variables found — no admins created.',
      );
    } else {
      this.logger.log(`Seeding complete. Created ${seeded} admin(s).`);
    }
  }
}
