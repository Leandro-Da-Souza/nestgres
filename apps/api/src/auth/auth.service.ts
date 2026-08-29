import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async authenticate(data: LoginDto): Promise<{ access_token: string }> {
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

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
