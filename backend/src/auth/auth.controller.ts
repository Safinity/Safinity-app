import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthRequiredGuard } from './auth.guards';
import { AuthService } from './auth.service';
import type { LoginDto, RegisterDto, RequestWithUser } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Get('me')
  @UseGuards(AuthRequiredGuard)
  me(@Req() request: RequestWithUser) {
    return this.authService.getAuthenticatedProfile(request.user!.id);
  }
}
