import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/profile')
  getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }

  @Get(':userId/friends/event/:eventId')
  getFriends(
    @Param('userId') userId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.usersService.findFriendsAtEvent(userId, BigInt(eventId));
  }
}
