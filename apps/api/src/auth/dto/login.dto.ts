import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import type { LoginRequest } from '@nestgres/contracts';

export class LoginDto implements LoginRequest {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
