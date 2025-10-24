import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }
    if (!user.password) {
      throw new UnauthorizedException('User has no password set yet');
    }
    const passwordsMatch = await bcrypt.compare(pass, user.password);
    if (!passwordsMatch) {
      throw new UnauthorizedException('Invalid password');
    }
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
