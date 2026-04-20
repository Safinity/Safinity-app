import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthRequiredGuard } from '../auth/auth.guards';
import { AuthService } from '../auth/auth.service';
import type { RequestWithUser } from '../auth/auth.types';
import { UpdateCredentialsDto } from '../auth/dto/update-credentials.dto';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthRequiredGuard)
  async getMe(@Req() req: RequestWithUser) {
    return this.authService.getAuthenticatedProfile(req.user!.id);
  }

  @Patch('me/edit-profile')
  @UseGuards(AuthRequiredGuard)
  updateProfile(
    @Req() request: RequestWithUser,
    @Body() body: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(request.user!.id, body);
  }

  @Patch('me/credentials')
  @UseGuards(AuthRequiredGuard)
  updateCredentials(
    @Req() request: RequestWithUser,
    @Body() body: UpdateCredentialsDto,
  ) {
    return this.authService.updateCredentials(request.user!.id, body);
  }
}