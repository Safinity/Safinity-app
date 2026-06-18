import {
  BadRequestException,
  Injectable,
  NotFoundException,
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

type ClerkEmailAddressSnapshot = {
  id?: string | null;
  emailAddress?: string | null;
};

type ClerkUserSnapshot = {
  emailAddresses?: ClerkEmailAddressSnapshot[] | null;
  primaryEmailAddressId?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
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

function getPrimaryEmail(clerkUser: ClerkUserSnapshot) {
  const emailAddresses = clerkUser.emailAddresses ?? [];
  const primaryEmail = emailAddresses.find(
    (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
  );

  return (
    primaryEmail?.emailAddress ??
    emailAddresses.find((emailAddress) => emailAddress.emailAddress)
      ?.emailAddress ??
    null
  );
}

function getDisplayName(clerkUser: ClerkUserSnapshot) {
  return (
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
    clerkUser.fullName ||
    null
  );
}

function normalizeUsername(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);

  return normalized || null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clerkService: ClerkService,
  ) {}

  private toBase64Image(image: Uint8Array | null) {
    return image ? Buffer.from(image).toString('base64') : null;
  }

  private async getAvailableUsername(
    preferredUsername: string | null,
    email: string | null,
    clerkUserId: string,
  ) {
    const fallbackUsername = `user_${clerkUserId.replace(/[^a-z0-9]/gi, '').slice(-12)}`;
    const baseUsername =
      normalizeUsername(email?.split('@')[0] ?? null) ??
      normalizeUsername(preferredUsername) ??
      fallbackUsername;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const suffix = attempt === 0 ? '' : `_${attempt + 1}`;
      const username = `${baseUsername.slice(0, 32 - suffix.length)}${suffix}`;
      const existingUser = await this.prisma.users.findUnique({
        where: { username },
        select: { id: true },
      });

      if (!existingUser) {
        return username;
      }
    }

    return fallbackUsername.slice(0, 32);
  }

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
      const clerkUser = (await this.clerkService.client.users.getUser(
        clerkUserId,
      )) as ClerkUserSnapshot;

      const email = getPrimaryEmail(clerkUser);
      const username = await this.getAvailableUsername(
        clerkUser.username ?? null,
        email,
        clerkUserId,
      );
      const name = getDisplayName(clerkUser);

      const [createdUser] = await this.prisma.$queryRaw<Array<{ id: string }>>`
        INSERT INTO public.users (clerk_id, email, username, name, role, password_hash)
        VALUES (${clerkUserId}, ${email}, ${username}, ${name}, 'user', '')
        ON CONFLICT (clerk_id) DO UPDATE SET
          email = COALESCE(public.users.email, EXCLUDED.email),
          username = COALESCE(public.users.username, EXCLUDED.username),
          name = COALESCE(public.users.name, EXCLUDED.name)
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
        user_tickets: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                venue_name: true,
                description: true,
                status: true,
                category: true,
                start_date: true,
                end_date: true,
              },
            },
          },
        },
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
      image: this.toBase64Image(user.image),
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

  async deleteAccount(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, clerk_id: true },
    });

    if (!user) {
      throw new NotFoundException('Authenticated user not found');
    }

    await this.prisma.$transaction(async (tx) => {
      const [userTickets, userSos, staffDetails] = await Promise.all([
        tx.user_tickets.findMany({
          where: { user_id: user.id },
          select: { ticket_code: true },
        }),
        tx.sos.findMany({
          where: { user_id: user.id },
          select: { id: true },
        }),
        tx.staff_details.findUnique({
          where: { user_id: user.id },
          select: { id: true },
        }),
      ]);

      const ticketCodes = userTickets.map((ticket) => ticket.ticket_code);
      const sosIds = userSos.map((sos) => sos.id);

      if (staffDetails) {
        await tx.alerts.deleteMany({ where: { staff_id: staffDetails.id } });
      }

      if (sosIds.length > 0) {
        await tx.alerts.deleteMany({ where: { sos_id: { in: sosIds } } });
      }

      await Promise.all([
        tx.user_notification_status.deleteMany({ where: { user_id: user.id } }),
        tx.user_favorites.deleteMany({ where: { user_id: user.id } }),
        tx.friendship.deleteMany({
          where: {
            OR: [{ user1_id: user.id }, { user2_id: user.id }],
          },
        }),
        tx.user_locations.deleteMany({ where: { user_id: user.id } }),
      ]);

      if (ticketCodes.length > 0) {
        await tx.event_tickets_master.updateMany({
          where: { ticket_code: { in: ticketCodes } },
          data: { is_already_linked: false },
        });
      }

      await tx.user_tickets.deleteMany({ where: { user_id: user.id } });
      await tx.staff_details.deleteMany({ where: { user_id: user.id } });
      await tx.sos.deleteMany({ where: { user_id: user.id } });
      await tx.users.delete({ where: { id: user.id } });
    });

    await this.clerkService.client.users.deleteUser(user.clerk_id);

    return { message: 'Account deleted successfully.' };
  }
}
