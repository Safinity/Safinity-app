// src/users/users.controller.ts
import { Controller, Get, Req } from '@nestjs/common';
import type { RequestWithUser } from '../auth/auth.types';

@Controller('users')
export class UsersController {
  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    return req.user;
  }
}
