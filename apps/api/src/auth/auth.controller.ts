import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { type AuthenticatedRequestType } from '../common/types/shared.types';
import { Public } from '../common/decorators/public.decorator';
import type { Response } from 'express';
import type { AuthenticatedUser, LoginData } from '@nestgres/contracts';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginData> {
    const { accessToken, user } = await this.authService.authenticate(data);

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    return { user };
  }

  @Get('profile')
  async getProfile(
    @Request() req: AuthenticatedRequestType,
  ): Promise<AuthenticatedUser> {
    return await this.userService.getUserProfileData(req.user.sub);
  }
}
