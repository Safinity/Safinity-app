import { Controller, Get, Post, Param, Query, Req } from '@nestjs/common';
import { FriendsService } from './friends.service';
import type { RequestWithUser } from '../auth/auth.types'; 

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('all')
  async getAll(@Req() req: RequestWithUser) {
    return this.friendsService.getFriendsGroupedByEvent(req.user!.id);
  }

  @Get('search')
  async search(@Query('q') query: string, @Req() req: RequestWithUser) {
    return this.friendsService.searchUsers(query, req.user!.id);
  }

  // Enviar Pedido (fica PENDING) ou Cancelar/Remover se já existir
  @Post('toggle/:friendId')
  async toggle(@Param('friendId') friendId: string, @Req() req: RequestWithUser) {
    return this.friendsService.toggleFriendship(req.user!.id, friendId);
  }

  // Aceitar Pedido que recebeste
  @Post('accept/:friendId')
  async accept(@Param('friendId') friendId: string, @Req() req: RequestWithUser) {
    return this.friendsService.acceptFriendship(req.user!.id, friendId);
  }

  @Get('profile/:friendId')
  async getProfile(@Param('friendId') friendId: string, @Req() req: RequestWithUser) {
    return this.friendsService.getFriendProfile(req.user!.id, friendId);
  }

  @Get('requests/pending')
async getPending(@Req() req: RequestWithUser) {
  return this.friendsService.getPendingRequests(req.user!.id);
}
}