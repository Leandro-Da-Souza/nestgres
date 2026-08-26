import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { USER_ROLES, type UserRole } from '../types/userType';

export class CreateUserDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  organizationId?: number | null;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @IsIn([...USER_ROLES])
  role!: UserRole;
}
