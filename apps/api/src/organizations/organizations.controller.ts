import { Controller, Get } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import type { OrganizationType } from './types/organization.type';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}
  @Get()
  async getOrganizations(): Promise<OrganizationType[]> {
    return await this.organizationsService.getOrganizations();
  }
}
