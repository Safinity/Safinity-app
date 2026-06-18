import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthRequiredGuard } from '../auth/auth.guards';
import { AuthService } from '../auth/auth.service';
import type { RequestWithUser } from '../auth/auth.types';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Get('me')
  @UseGuards(AuthRequiredGuard)
  async getMe(@Req() req: RequestWithUser) {
    return this.authService.getAuthenticatedProfile(req.user!.clerk_id);
  }

  @Patch('me/edit-profile')
  @UseGuards(AuthRequiredGuard)
  updateProfile(
    @Req() request: RequestWithUser,
    @Body() body: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(request.user!.id, body);
  }

  @Patch('me/location')
  @UseGuards(AuthRequiredGuard)
  updateMyLocation(
    @Req() request: RequestWithUser,
    @Body() body: { lat?: number; lng?: number },
  ) {
    return this.usersService.updateMyLocation(request.user!.id, body);
  }

  @Post('me/push-token')
  @UseGuards(AuthRequiredGuard)
  registerPushToken(
    @Req() request: RequestWithUser,
    @Body() body: { token?: string; platform?: string },
  ) {
    return this.usersService.registerPushToken(request.user!.id, body);
  }

  @Delete('me')
  @UseGuards(AuthRequiredGuard)
  deleteAccount(@Req() request: RequestWithUser) {
    return this.authService.deleteAccount(request.user!.id);
  }
}
