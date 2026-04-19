import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthRequiredGuard } from '../auth/auth.guards';
import type { RequestWithUser } from '../auth/auth.types';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/profile')
  @UseGuards(AuthRequiredGuard)
  getMyProfile(@Req() request: RequestWithUser) {
    return this.usersService.getMyProfile(request.user);
  }

  @Get(':id/profile')
  getProfile(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.usersService.getProfile(id, request.user);
  }

  @Get(':userId/friends/event/:eventId')
  getFriends(
    @Param('userId') userId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.usersService.findFriendsAtEvent(userId, BigInt(eventId));
  }
}
