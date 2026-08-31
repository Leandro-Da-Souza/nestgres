import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserType } from './types/userType';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { type AuthenticatedRequestType } from '../common/types/shared.types';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Roles('admin', 'super_admin')
  @Get()
  getUsers(@Request() req: AuthenticatedRequestType): Promise<UserType[]> {
    return this.userService.getAllUsers(req.user);
  }

  @Roles('admin', 'super_admin')
  @Get(':id')
  getUser(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequestType,
  ): Promise<UserType> {
    return this.userService.getUserById(id, req.user);
  }

  @Roles('super_admin')
  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }

  @Roles('super_admin')
  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
    @Request() req: AuthenticatedRequestType,
  ): Promise<UserType> {
    return this.userService.updateUser(id, body);
  }

  @Roles('super_admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.deleteUser(id);
  }
}
