import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { signInDto } from 'src/auth/schemas/signInDto';
import type { SignInUserDto } from 'src/auth/schemas/signInDto';
import {
  resetAndInitializeDto,
  type ResetAndInitializeDto,
} from 'src/auth/schemas/resetAndInitializeDto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { AuthGuard } from './auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body(new ZodValidationPipe(signInDto)) body: SignInUserDto) {
    return this.authService.signIn(body.email, body.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    const resetToken = await this.usersService.createPasswordResetToken(email);
    return { message: 'Password reset link sent to email' };
  }

  @Public()
  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body(new ZodValidationPipe(resetAndInitializeDto))
    body: ResetAndInitializeDto,
  ) {
    const { password, passwordConfirm } = body;
    if (!password || !passwordConfirm) {
      throw new BadRequestException(
        'password and passwordConfirm are required',
      );
    }

    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }
    await this.usersService.resetPassword(token, password);
    return { message: 'Password has been successfully reset' };
  }

  @Public()
  @Post('initialize-password/:token')
  async initializePassword(
    @Param('token') token: string,
    @Body(new ZodValidationPipe(resetAndInitializeDto))
    body: ResetAndInitializeDto,
  ) {
    const { password, passwordConfirm } = body;

    if (!token || !password || !passwordConfirm) {
      throw new BadRequestException(
        'Token, password and passwordConfirm are required',
      );
    }

    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    await this.usersService.initializePassword(token, password);

    return { message: 'Password successfully set. You can now login.' };
  }
}
