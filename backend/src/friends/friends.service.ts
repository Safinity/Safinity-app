import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  FriendResponseDto,
  FriendsGroupedDto,
  FriendProfileDto,
} from './dto/friend-list.dto';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async getFriendsGroupedByEvent(userId: string): Promise<FriendsGroupedDto> {
    const myTicket = await this.prisma.user_tickets.findFirst({
      where: { user_id: userId },
      select: { event_id: true },
      orderBy: { linked_at: 'desc' },
    });

    const myEventId = myTicket?.event_id;

    const friendships = await this.prisma.friendship.findMany({
      where: {
        state: 'ACCEPTED',
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
      include: {
        users_friendship_user1_idTousers: {
          include: { user_tickets: { select: { event_id: true } } },
        },
        users_friendship_user2_idTousers: {
          include: { user_tickets: { select: { event_id: true } } },
        },
      },
    });

    const result = new FriendsGroupedDto();

    friendships.forEach((f) => {
      const friendData =
        f.user1_id === userId
          ? f.users_friendship_user2_idTousers
          : f.users_friendship_user1_idTousers;

      if (!friendData) return;

      const isAtSameEvent = !!(
        myEventId &&
        friendData.user_tickets.some((t) => t.event_id === myEventId)
      );

      const friendObj: FriendResponseDto = {
        id: friendData.id,
        name: friendData.name || '',
        username: friendData.username || '',
        image: friendData.image
          ? Buffer.from(friendData.image).toString('base64')
          : null,
        isOnSameEvent: isAtSameEvent,
      };

      if (isAtSameEvent) result.onSameEvent.push(friendObj);
      else result.otherFriends.push(friendObj);
    });

    return result;
  }

  async searchUsers(query: string, currentUserId: string) {
    const users = await this.prisma.users.findMany({
      where: {
        id: { not: currentUserId },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, username: true, image: true },
      take: 15,
    });

    return users.map((u) => ({
      ...u,
      image: u.image ? Buffer.from(u.image).toString('base64') : null,
    }));
  }

  async toggleFriendship(userId: string, friendId: string) {
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { user1_id: userId, user2_id: friendId },
          { user1_id: friendId, user2_id: userId },
        ],
      },
    });

    if (existing) {
      return this.prisma.friendship.delete({ where: { id: existing.id } });
    }

    return this.prisma.friendship.create({
      data: {
        id: BigInt(Date.now()),
        user1_id: userId,
        user2_id: friendId,
        state: 'PENDING',
      },
    });
  }

  async acceptFriendship(userId: string, friendId: string) {
    const request = await this.prisma.friendship.findFirst({
      where: {
        user1_id: friendId,
        user2_id: userId,
        state: 'PENDING',
      },
    });

    if (!request) throw new NotFoundException('Pedido não encontrado');

    return this.prisma.friendship.update({
      where: { id: request.id },
      data: { state: 'ACCEPTED' },
    });
  }

  async getPendingRequests(userId: string) {
    const requests = await this.prisma.friendship.findMany({
      where: {
        user2_id: userId,
        state: 'PENDING',
      },
      include: {
        users_friendship_user1_idTousers: true,
      },
    });

    return requests.map((r) => {
      // Usamos o "!" para garantir ao TS que o utilizador existe
      const sender = r.users_friendship_user1_idTousers!;

      return {
        id: r.id.toString(),
        sender: {
          id: sender.id,
          name: sender.name,
          username: sender.username,
          image: sender.image
            ? Buffer.from(sender.image).toString('base64')
            : null,
        },
      };
    });
  }

  async getFriendProfile(
    userId: string,
    friendId: string,
  ): Promise<FriendProfileDto> {
    const friend = await this.prisma.users.findUnique({
      where: { id: friendId },
      include: { user_tickets: { include: { event: true } } },
    });

    if (!friend) throw new NotFoundException('Amigo não encontrado');

    const myTickets = await this.prisma.user_tickets.findMany({
      where: { user_id: userId },
      select: { event_id: true },
    });

    const myEventIds = myTickets.map((t) => t.event_id);
    const commonEvents = friend.user_tickets
      .filter((t) => myEventIds.includes(t.event_id))
      .map((t) => t.event);

    return {
      id: friend.id,
      name: friend.name || '',
      username: friend.username || '',
      image: friend.image ? Buffer.from(friend.image).toString('base64') : null,
      totalEventsCount: friend.user_tickets.length,
      commonEvents: commonEvents,
    };
  }
}
