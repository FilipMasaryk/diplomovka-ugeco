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

  async signIn(
    email: string,
    pass: string,
    rememberMe?: boolean,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordsMatch = await bcrypt.compare(pass, user.password);
    if (!passwordsMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      id: user._id,
      name: user.name,
      surName: user.surName,
      email: user.email,
      role: user.role,
      countries: user.countries ?? [],
      brands: user.brands ?? [],
    };

    const expiresIn = rememberMe ? '30d' : '1h';
    return {
      access_token: await this.jwtService.signAsync(payload, { expiresIn }),
    };
  }
}
