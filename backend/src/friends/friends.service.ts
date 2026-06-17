import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsRealtimeService } from '../notifications/notifications-realtime.service';
import { AddFriendFromQrDto } from './dto/add-friend-from-qr.dto';
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

const FRIEND_QR_TYPE = 'safinity.friend';
const ACCEPTED_STATE = 'ACCEPTED';
const PENDING_STATE = 'PENDING';

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
    private readonly realtime: NotificationsRealtimeService,
  ) {}

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

  private toBase64Image(image: Uint8Array | null) {
    return image ? Buffer.from(image).toString('base64') : null;
  }

  private generateBigIntId() {
    return (
      BigInt(Date.now()) * BigInt(1000) +
      BigInt(Math.floor(Math.random() * 1000))
    );
  }

  private parseQrFriendUserId(body: AddFriendFromQrDto) {
    if (body.userId?.trim()) {
      return body.userId.trim();
    }

    const payload = body.payload?.trim();

    if (!payload) {
      throw new BadRequestException('QR payload or userId is required');
    }

    try {
      const parsed = JSON.parse(payload) as {
        type?: unknown;
        userId?: unknown;
      };

      if (
        parsed.type === FRIEND_QR_TYPE &&
        typeof parsed.userId === 'string' &&
        parsed.userId.trim()
      ) {
        return parsed.userId.trim();
      }
    } catch {
      // Try URL formats below.
    }

    try {
      const url = new URL(payload);
      const userId =
        url.searchParams.get('userId') ?? url.searchParams.get('friendId');

      if (userId?.trim()) {
        return userId.trim();
      }
    } catch {
      // Fall through to plain id support.
    }

    if (/^[0-9a-fA-F-]{36}$/.test(payload)) {
      return payload;
    }

    throw new BadRequestException('Invalid friend QR payload');
  }

  async getFriendsGroupedByEvent(
    userId: string,
    query?: FriendsListQuery,
  ): Promise<FriendsGroupedDto> {
    const myActiveTickets = await this.prisma.user_tickets.findMany({
      where: {
        user_id: userId,
        event: { status: { equals: 'active', mode: 'insensitive' } },
      },
      select: { event_id: true },
    });

    const myActiveEventIds = new Set(
      myActiveTickets.map((ticket) => ticket.event_id.toString()),
    );

    const friendships = await this.prisma.friendship.findMany({
      where: {
        state: { in: [ACCEPTED_STATE, ACCEPTED_STATE.toLowerCase()] },
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
      include: {
        users_friendship_user1_idTousers: {
          include: {
            user_tickets: {
              where: {
                event: { status: { equals: 'active', mode: 'insensitive' } },
              },
              select: { event_id: true },
            },
          },
        },
        users_friendship_user2_idTousers: {
          include: {
            user_tickets: {
              where: {
                event: { status: { equals: 'active', mode: 'insensitive' } },
              },
              select: { event_id: true },
            },
          },
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

      const isAtSameEvent = friendData.user_tickets.some((ticket) =>
        myActiveEventIds.has(ticket.event_id.toString()),
      );

      const friendObj: FriendResponseDto = {
        id: friendData.id,
        name: friendData.name || '',
        username: friendData.username || '',
        image: this.toBase64Image(friendData.image),
        isOnSameEvent: isAtSameEvent,
        friendshipState: ACCEPTED_STATE,
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
    const search = query.query?.trim();

    const users = await this.prisma.users.findMany({
      where: {
        id: { not: currentUserId },
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: { id: true, name: true, username: true, image: true },
      orderBy: {
        [query.sortBy ?? 'name']: query.sortOrder ?? 'asc',
      },
      skip,
      take: pageSize,
    });

    const userIds = users.map((user) => user.id);
    const friendships =
      userIds.length > 0
        ? await this.prisma.friendship.findMany({
            where: {
              OR: [
                { user1_id: currentUserId, user2_id: { in: userIds } },
                { user1_id: { in: userIds }, user2_id: currentUserId },
              ],
            },
            select: {
              user1_id: true,
              user2_id: true,
              state: true,
            },
          })
        : [];
    const friendshipStateByUserId = new Map(
      friendships.map((friendship) => [
        friendship.user1_id === currentUserId
          ? friendship.user2_id
          : friendship.user1_id,
        friendship.state,
      ]),
    );

    return users.map((u) => ({
      ...u,
      image: this.toBase64Image(u.image),
      friendshipState: friendshipStateByUserId.get(u.id) ?? null,
    }));
  }

  async getFriendQrCode(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, image: true },
    });

    if (!user) {
      throw new NotFoundException('Authenticated user not found');
    }

    const payload = JSON.stringify({
      type: FRIEND_QR_TYPE,
      version: 1,
      userId: user.id,
    });

    return {
      payload,
      user: {
        id: user.id,
        name: user.name || '',
        username: user.username || '',
        image: this.toBase64Image(user.image),
      },
    };
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
      const deleted = await this.prisma.friendship.delete({
        where: { id: existing.id },
      });
      this.realtime.emitFriendshipUpdated([deleted.user1_id, deleted.user2_id]);

      return deleted;
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        id: this.generateBigIntId(),
        user1_id: userId,
        user2_id: friendId,
        state: PENDING_STATE,
      },
    });
    this.realtime.emitFriendRequest(friendId, friendship.id.toString());

    return friendship;
  }

  async previewFriendFromQrCode(userId: string, body: AddFriendFromQrDto) {
    const friendId = this.parseQrFriendUserId(body);

    if (friendId === userId) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }

    const friend = await this.prisma.users.findUnique({
      where: { id: friendId },
      select: { id: true, name: true, username: true, image: true },
    });

    if (!friend) {
      throw new NotFoundException('Friend not found');
    }

    return {
      friend: {
        id: friend.id,
        name: friend.name || '',
        username: friend.username || '',
        image: this.toBase64Image(friend.image),
      },
    };
  }

  async addFriendFromQrCode(userId: string, body: AddFriendFromQrDto) {
    const friendId = this.parseQrFriendUserId(body);

    if (friendId === userId) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }

    const friend = await this.prisma.users.findUnique({
      where: { id: friendId },
      select: { id: true, name: true, username: true, image: true },
    });

    if (!friend) {
      throw new NotFoundException('Friend not found');
    }

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { user1_id: userId, user2_id: friendId },
          { user1_id: friendId, user2_id: userId },
        ],
      },
    });

    const friendship = existing
      ? await this.prisma.friendship.update({
          where: { id: existing.id },
          data: { state: ACCEPTED_STATE },
        })
      : await this.prisma.friendship.create({
          data: {
            id: this.generateBigIntId(),
            user1_id: userId,
            user2_id: friendId,
            state: ACCEPTED_STATE,
          },
        });
    this.realtime.emitFriendshipUpdated([userId, friendId]);

    return {
      state: friendship.state,
      friendshipId: friendship.id.toString(),
      friend: {
        id: friend.id,
        name: friend.name || '',
        username: friend.username || '',
        image: this.toBase64Image(friend.image),
      },
    };
  }

  async acceptFriendship(userId: string, friendId: string) {
    const request = await this.prisma.friendship.findFirst({
      where: {
        user1_id: friendId,
        user2_id: userId,
        state: PENDING_STATE,
      },
    });

    if (!request) throw new NotFoundException('Pedido não encontrado');

    const friendship = await this.prisma.friendship.update({
      where: { id: request.id },
      data: { state: ACCEPTED_STATE },
    });
    this.realtime.emitFriendshipUpdated([userId, friendId]);

    return friendship;
  }

  async getPendingRequests(userId: string) {
    const requests = await this.prisma.friendship.findMany({
      where: {
        user2_id: userId,
        state: PENDING_STATE,
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
          image: this.toBase64Image(sender.image),
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
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { user1_id: userId, user2_id: friendId },
          { user1_id: friendId, user2_id: userId },
        ],
      },
      select: { state: true },
    });

    const myEventIds = myTickets.map((t) => t.event_id);
    const commonEvents = friend.user_tickets
      .filter((t) => myEventIds.includes(t.event_id))
      .map((t) => t.event);

    return {
      id: friend.id,
      name: friend.name || '',
      username: friend.username || '',
      image: this.toBase64Image(friend.image),
      friendshipState: friendship?.state ?? null,
      totalEventsCount: friend.user_tickets.length,
      commonEvents: commonEvents,
    };
  }
}
