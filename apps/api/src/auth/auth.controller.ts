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
import { AuthenticatedUser, AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { type AuthenticatedRequestType } from '../common/types/shared.types';
import { Public } from '../common/decorators/public.decorator';
import { type Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: AuthenticatedUser }> {
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
  getProfile(@Request() req: AuthenticatedRequestType) {
    return req.user;
  }
}
