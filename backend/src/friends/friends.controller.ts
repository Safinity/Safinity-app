import { Controller, Get, Post, Param, Query, Req } from '@nestjs/common';
import { FriendsService } from './friends.service';
import type { RequestWithUser } from '../auth/auth.types';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('all')
  async getAll(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('inEvent') inEvent?: 'true' | 'false',
    @Query('sortBy') sortBy?: 'name' | 'username',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.friendsService.getFriendsGroupedByEvent(req.user!.id, {
      page,
      pageSize,
      search,
      inEvent,
      sortBy,
      sortOrder,
    });
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: 'name' | 'username',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.friendsService.searchUsers(req.user!.id, {
      query,
      page,
      pageSize,
      sortBy,
      sortOrder,
    });
  }

  // Enviar Pedido (fica PENDING) ou Cancelar/Remover se já existir
  @Post('toggle/:friendId')
  async toggle(
    @Param('friendId') friendId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.friendsService.toggleFriendship(req.user!.id, friendId);
  }

  // Aceitar Pedido que recebeste
  @Post('accept/:friendId')
  async accept(
    @Param('friendId') friendId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.friendsService.acceptFriendship(req.user!.id, friendId);
  }

  @Get('profile/:friendId')
  async getProfile(
    @Param('friendId') friendId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.friendsService.getFriendProfile(req.user!.id, friendId);
  }

  @Get('requests/pending')
  async getPending(@Req() req: RequestWithUser) {
    return this.friendsService.getPendingRequests(req.user!.id);
  }
}
