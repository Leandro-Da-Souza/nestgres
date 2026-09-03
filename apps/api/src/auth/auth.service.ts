import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import type { UserType } from '../users/types/userType';

export type AuthenticatedUser = Pick<
  UserType,
  'id' | 'organizationId' | 'displayName' | 'email' | 'role' | 'active'
>;

export type LoginResult = {
  accessToken: string;
  user: AuthenticatedUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async authenticate(data: LoginDto): Promise<LoginResult> {
    const { email: submittedEmail, password: submittedPassword } = data;

    const user =
      await this.userService.findUserForAuthentication(submittedEmail);

    if (user === null || !user.active || user.passwordHash === null) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const match = await argon2.verify(user.passwordHash, submittedPassword);

    if (!match) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        organizationId: user.organizationId,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        active: user.active,
      },
    };
  }
}
