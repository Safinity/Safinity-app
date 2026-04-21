import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  FriendResponseDto,
  FriendsGroupedDto,
  FriendProfileDto,
} from './dto/friend-list.dto';

type FriendsListQuery = {
  page?: string;
  pageSize?: string;
  search?: string;
  inEvent?: 'true' | 'false';
  sortBy?: 'name' | 'username';
  sortOrder?: 'asc' | 'desc';
};

type FriendsSearchQuery = {
  query: string;
  page?: string;
  pageSize?: string;
  sortBy?: 'name' | 'username';
  sortOrder?: 'asc' | 'desc';
};

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  private parsePositiveInt(
    value: string | undefined,
    fallback: number,
  ): number {
    if (!value) {
      return fallback;
    }

    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }

    return parsed;
  }

  async getFriendsGroupedByEvent(
    userId: string,
    query?: FriendsListQuery,
  ): Promise<FriendsGroupedDto> {
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

    const allFriends: FriendResponseDto[] = [];

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

      allFriends.push(friendObj);
    });

    const filteredFriends = allFriends.filter((friend) => {
      if (query?.search) {
        const search = query.search.toLowerCase();
        const byName = friend.name.toLowerCase().includes(search);
        const byUsername = friend.username.toLowerCase().includes(search);

        if (!byName && !byUsername) {
          return false;
        }
      }

      if (query?.inEvent === 'true' && !friend.isOnSameEvent) {
        return false;
      }

      if (query?.inEvent === 'false' && friend.isOnSameEvent) {
        return false;
      }

      return true;
    });

    const sortBy = query?.sortBy ?? 'name';
    const sortOrder = query?.sortOrder ?? 'asc';

    const sortedFriends = filteredFriends.sort((left, right) => {
      const leftValue =
        sortBy === 'username'
          ? left.username.toLowerCase()
          : left.name.toLowerCase();
      const rightValue =
        sortBy === 'username'
          ? right.username.toLowerCase()
          : right.name.toLowerCase();

      if (leftValue < rightValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }

      return 0;
    });

    const page = this.parsePositiveInt(query?.page, 1);
    const pageSize = Math.min(this.parsePositiveInt(query?.pageSize, 20), 100);
    const skip = (page - 1) * pageSize;
    const pagedFriends = sortedFriends.slice(skip, skip + pageSize);

    const result = new FriendsGroupedDto();
    pagedFriends.forEach((friend) => {
      if (friend.isOnSameEvent) {
        result.onSameEvent.push(friend);
      } else {
        result.otherFriends.push(friend);
      }
    });

    return result;
  }

  async searchUsers(currentUserId: string, query: FriendsSearchQuery) {
    const page = this.parsePositiveInt(query.page, 1);
    const pageSize = Math.min(this.parsePositiveInt(query.pageSize, 15), 100);
    const skip = (page - 1) * pageSize;

    const users = await this.prisma.users.findMany({
      where: {
        id: { not: currentUserId },
        OR: [
          { name: { contains: query.query, mode: 'insensitive' } },
          { username: { contains: query.query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, username: true, image: true },
      orderBy: {
        [query.sortBy ?? 'name']: query.sortOrder ?? 'asc',
      },
      skip,
      take: pageSize,
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
