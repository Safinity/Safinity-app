import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthRequiredGuard } from '../auth/auth.guards';
import { AuthService } from '../auth/auth.service';
import type { RequestWithUser } from '../auth/auth.types';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

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

  @Delete('me')
  @UseGuards(AuthRequiredGuard)
  deleteAccount(@Req() request: RequestWithUser) {
    return this.authService.deleteAccount(request.user!.id);
  }
}
