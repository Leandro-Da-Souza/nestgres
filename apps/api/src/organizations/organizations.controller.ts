import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import type { OrganizationType } from './types/organization.type';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}
  @Get()
  getOrganizations(): Promise<OrganizationType[]> {
    return this.organizationsService.fetchOrganizations();
  }
  @Get(':id')
  getOrganizationById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrganizationType> {
    return this.organizationsService.fetchOrganizationById(id);
  }
}
