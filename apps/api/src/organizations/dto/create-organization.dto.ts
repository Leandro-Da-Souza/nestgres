import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsUppercase,
  Length,
} from 'class-validator';
import {
  ORGANIZATION_PLANS,
  type OrganizationPlan,
} from '../types/organizationType';

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
