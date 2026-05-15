import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ProfileViewer = {
  id?: string;
  sub?: string;
};

type ProfileMode = 'self' | 'friend' | 'public';

type UserProfile = {
  id: string;
  name: string | null;
  username: string | null;
  image: Buffer | null;
  role: string;
  email?: string | null;
  emergency_contact?: string | null;
  location?: unknown;
  user_tickets?: Array<{
    id: bigint;
    event_id: bigint;
    ticket_code: string;
    linked_at: Date | null;
  }>;
  user_favorites?: Array<{
    id: bigint;
    activity_id: bigint;
    event_activities: {
      id: bigint;
      event_id: bigint;
      name: string | null;
      start_time: Date;
      end_time: Date;
      description: string | null;
      image: Buffer | null;
    };
  }>;
  relationship?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize<T>(value: T): T {
    const replacer = (_key: string, currentValue: unknown): unknown => {
      if (typeof currentValue === 'bigint') {
        return currentValue.toString();
      }

      return currentValue;
    };

    return JSON.parse(JSON.stringify(value, replacer)) as T;
  }

  private normalizeViewerId(viewer?: ProfileViewer) {
    return viewer?.id ?? viewer?.sub;
  }

  private async resolveProfileMode(
    targetUserId: string,
    viewerId?: string,
  ): Promise<ProfileMode> {
    if (!viewerId) {
      return 'public';
    }

    if (viewerId === targetUserId) {
      return 'self';
    }

    const friendship = await this.prisma.friendship.findFirst({
      where: {
        state: 'accepted',
        OR: [
          { user1_id: viewerId, user2_id: targetUserId },
          { user1_id: targetUserId, user2_id: viewerId },
        ],
      },
      select: { id: true },
    });

    return friendship ? 'friend' : 'public';
  }

  private async getUserRecord(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        user_tickets: true,
        user_favorites: {
          include: {
            event_activities: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  private mapProfile(user: UserProfile, mode: ProfileMode) {
    const publicProfile = {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      role: user.role,
      profile_mode: mode,
    };

    if (mode === 'public') {
      return publicProfile;
    }

    if (mode === 'friend') {
      return {
        ...publicProfile,
        relationship: 'friend',
      };
    }

    return {
      ...publicProfile,
      email: user.email,
      emergency_contact: user.emergency_contact,
      location: user.location,
      user_tickets: user.user_tickets ?? [],
      user_favorites: user.user_favorites ?? [],
    };
  }

  async getProfile(id: string, viewer?: ProfileViewer) {
    const user = await this.getUserRecord(id);
    const viewerId = this.normalizeViewerId(viewer);
    const mode = await this.resolveProfileMode(id, viewerId);

    return this.serialize(this.mapProfile(user as UserProfile, mode));
  }

  async getMyProfile(viewer?: ProfileViewer) {
    const viewerId = this.normalizeViewerId(viewer);

    if (!viewerId) {
      throw new NotFoundException('Authenticated user not found');
    }

    return this.getProfile(viewerId, { id: viewerId });
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
