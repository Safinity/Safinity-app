import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { AuthRequiredGuard } from './auth.guards';

import { AuthService } from './auth.service';

import type { RequestWithUser } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthRequiredGuard)
  me(@Req() request: RequestWithUser) {
    return this.authService.getAuthenticatedProfile(request.user!.clerk_id);
  }
}
