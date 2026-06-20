import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from '../auth/auth.guards';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { RequestWithUser } from '../auth/auth.types';
import { AdminUsersService } from './users.admin.service';

@ApiTags('admin-organization-users')
@Controller('admin/organization-users')
@UseGuards(AuthRequiredGuard, RolesGuard)
@Roles('staff', 'admin')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  getOrganizationUsers(@Req() request: RequestWithUser) {
    return this.adminUsersService.getOrganizationUsers(request.user);
  }

  @Post()
  createOrganizationUser(
    @Req() request: RequestWithUser,
    @Body() body: unknown,
  ) {
    return this.adminUsersService.createOrganizationUser(
      request.user,
      body as {
        name?: string;
        username?: string;
        email?: string;
        password?: string;
        role?: string;
        role_in_org?: string;
      },
    );
  }

  @Patch(':userId')
  updateOrganizationUser(
    @Req() request: RequestWithUser,
    @Param('userId') userId: string,
    @Body() body: unknown,
  ) {
    return this.adminUsersService.updateOrganizationUser(
      request.user,
      userId,
      body as {
        name?: string;
        role?: string;
        role_in_org?: string;
      },
    );
  }
}
