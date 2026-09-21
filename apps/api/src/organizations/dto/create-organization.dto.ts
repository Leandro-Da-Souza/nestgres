import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsUppercase,
  Length,
} from 'class-validator';
import { ORGANIZATION_PLANS } from '../constants/organization.constants';
import type { OrganizationPlan } from '@nestgres/contracts';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([...ORGANIZATION_PLANS])
  plan!: OrganizationPlan;

  @IsString()
  @Length(2, 2)
  @IsUppercase()
  countryCode!: string;
}
