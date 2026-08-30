import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Body,
  Patch,
  Delete,
  HttpStatus,
  HttpCode,
  Request,
} from '@nestjs/common';
import type { OrganizationType } from './types/organizationType';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationUserType } from './types/organizationUserType';
import { OrganizationInvoiceType } from './types/organizationInvoiceType';
import { OrganizationSummaryType } from './types/organizationSummaryType';
import { type AuthenticatedRequestType } from '../common/types/shared.types';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}
  @Get()
  getOrganizations(): Promise<OrganizationType[]> {
    return this.organizationsService.getOrganizations();
  }

  @Get(':id')
  getOrganizationById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrganizationType> {
    return this.organizationsService.getOrganizationById(id);
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteOrganization(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.organizationsService.deleteOrganization(id);
  }

  @Get(':id/users')
  getOrganizationUsers(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrganizationUserType[]> {
    return this.organizationsService.getOrganizationUsers(id);
  }

  @Get(':id/invoices')
  getOrganizationInvoices(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrganizationInvoiceType[]> {
    return this.organizationsService.getOrganizationInvoices(id);
  }

  @Roles('admin', 'super_admin')
  @Get(':id/summary')
  getOrganizationSummary(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequestType,
  ): Promise<OrganizationSummaryType> {
    return this.organizationsService.getOrganizationSummary(id, req.user);
  }
}
