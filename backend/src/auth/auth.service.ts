import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ClerkService } from './clerk.service';

type SelfProfileUser = {
  id: string;
  clerk_id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  role: string;
  email: string | null;
  emergency_contact: string | null;
  user_tickets: Array<unknown>;
  user_favorites: Array<unknown>;
};

function isClerkRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as {
    status?: unknown;
    code?: unknown;
  };

  return maybeError.status === 429 || maybeError.code === 'api_response_error';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clerkService: ClerkService,
  ) {}

  /**
   * Development helper:
   * Ensures a Clerk user exists in your DB.
   * Clerk is the source of truth for identity.
   */
  async findOrCreateUser(clerkUserId: string) {
    // First, check if user exists in DB
    const [existingUser] = await this.prisma.$queryRaw<
      Array<{ id: string }>
    >`SELECT "id" FROM public.users WHERE clerk_id = ${clerkUserId} LIMIT 1`;

    if (existingUser) {
      return this.getSelfProfile(existingUser.id);
    }

    // User doesn't exist, fetch from Clerk to sync
    try {
      const clerkUser =
        await this.clerkService.client.users.getUser(clerkUserId);

      // Build fields to sync from Clerk
      const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? null;
      const username = clerkUser.username ?? null;
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
        clerkUser.fullName ||
        null;

      // Create new user
      const [createdUser] = await this.prisma.$queryRaw<Array<{ id: string }>>`
        INSERT INTO public.users (clerk_id, email, username, name, role, password_hash)
        VALUES (${clerkUserId}, ${email}, ${username}, ${name}, 'user', '')
        RETURNING "id"
      `;

      return this.getSelfProfile(createdUser.id);
    } catch (error: unknown) {
      // If Clerk API is rate-limited or unavailable, create a stub user
      if (isClerkRateLimitError(error)) {
        const [createdUser] = await this.prisma.$queryRaw<
          Array<{ id: string }>
        >`
          INSERT INTO public.users (clerk_id, email, username, name, role, password_hash)
          VALUES (${clerkUserId}, NULL, NULL, NULL, 'user', '')
          RETURNING "id"
        `;

        return this.getSelfProfile(createdUser.id);
      }

      // Re-throw other errors (token invalid, network error, etc.)
      throw error;
    }
  }

  /**
   * Internal DB profile builder
   */
  private async getSelfProfile(userId: string): Promise<SelfProfileUser> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
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
      throw new UnauthorizedException('Authenticated user not found');
    }

    return {
      id: user.id,
      clerk_id: user.clerk_id,
      name: user.name,
      username: user.username,
      image: user.image as unknown as string | null,
      role: user.role,
      email: user.email,
      emergency_contact: user.emergency_contact,
      user_tickets: user.user_tickets,
      user_favorites: user.user_favorites,
    };
  }

  /**
   * IMPORTANT:
   * This now expects Clerk ID, NOT Prisma ID
   */
  async getAuthenticatedProfile(clerkId: string): Promise<SelfProfileUser> {
    const user = await this.findOrCreateUser(clerkId);

    return this.getSelfProfile(user.id);
  }

  /**
   * Update profile (safe for dev + production)
   * Uses Prisma user.id internally
   */
  async updateProfile(
    userId: string,
    body: {
      name?: string;
      username?: string;
    },
  ) {
    const name = body.name?.trim();
    const username = body.username?.trim();

    if (!name && !username) {
      throw new BadRequestException('name or username is required');
    }

    if (username) {
      const existingUser = await this.prisma.users.findFirst({
        where: {
          id: { not: userId },
          username,
        },
        select: { id: true },
      });

      if (existingUser) {
        throw new BadRequestException('This username is already in use');
      }
    }

    return this.prisma.users.update({
      where: { id: userId },
      data: {
        name: name ?? undefined,
        username: username ?? undefined,
      },
    });
  }
}
