import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Body,
  Patch,
} from '@nestjs/common';
import type { OrganizationType } from './types/organizationType';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

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

  @Post()
  createOrganization(
    @Body() body: CreateOrganizationDto,
  ): Promise<OrganizationType> {
    return this.organizationsService.createOrganization(body);
  }

  @Patch(':id')
  updateOrganization(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: UpdateOrganizationDto,
  ): Promise<OrganizationType> {
    return this.organizationsService.updateOrganization(id, changes);
  }
}
