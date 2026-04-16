import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: { user_tickets: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findFriendsAtEvent(userId: string, eventId: bigint) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ user1_id: userId }, { user2_id: userId }],
        state: 'accepted',
      },
    });

    const friendIds = friendships
      .map((f) => (f.user1_id === userId ? f.user2_id : f.user1_id))
      .filter((id): id is string => id !== null);

    if (friendIds.length === 0) return [];

    return await this.prisma.users.findMany({
      where: {
        id: { in: friendIds },
        user_tickets: { some: { event_id: eventId } },
      },
      select: {
        id: true,
        name: true,
        username: true,
      },
    });
  }
}
