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
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationUserType } from './types/organizationUserType';
import { OrganizationInvoiceType } from './types/organizationInvoiceType';
import { type AuthenticatedRequestType } from '../common/types/shared.types';
import { Roles } from '../common/decorators/roles.decorator';
import { Organization, OrganizationSummary } from '@nestgres/contracts';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @Roles('admin', 'super_admin')
  getOrganizations(
    @Request() req: AuthenticatedRequestType,
  ): Promise<Organization[]> {
    return this.organizationsService.getOrganizations(req.user);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  getOrganizationById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequestType,
  ): Promise<Organization> {
    return this.organizationsService.getOrganizationById(id, req.user);
  }

  @Roles('super_admin')
  @Post()
  createOrganization(
    @Body() body: CreateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationsService.createOrganization(body);
  }

  @Roles('super_admin')
  @Patch(':id')
  updateOrganization(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: UpdateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationsService.updateOrganization(id, changes);
  }

  @Roles('super_admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteOrganization(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.organizationsService.deleteOrganization(id);
  }

  @Roles('admin', 'super_admin')
  @Get(':id/users')
  getOrganizationUsers(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequestType,
  ): Promise<OrganizationUserType[]> {
    return this.organizationsService.getOrganizationUsers(id, req.user);
  }

  @Roles('admin', 'super_admin')
  @Get(':id/invoices')
  getOrganizationInvoices(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequestType,
  ): Promise<OrganizationInvoiceType[]> {
    return this.organizationsService.getOrganizationInvoices(id, req.user);
  }

  @Roles('admin', 'super_admin')
  @Get(':id/summary')
  getOrganizationSummary(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequestType,
  ): Promise<OrganizationSummary> {
    return this.organizationsService.getOrganizationSummary(id, req.user);
  }
}
