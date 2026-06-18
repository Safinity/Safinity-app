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

  private toBase64Image(image: Uint8Array | null) {
    return image ? Buffer.from(image).toString('base64') : null;
  }

  /**
   * Development helper:
   * Ensures a Clerk user exists in your DB.
   * Clerk is the source of truth for identity.
   */
  async findOrCreateUser(clerkUserId: string) {
    console.log(`\n[BACKEND] 🔄 findOrCreateUser acionado para o Clerk ID: "${clerkUserId}"`);

    // First, check if user exists in DB
    console.log('[BACKEND] 🔍 Executando SELECT no PostgreSQL para verificar existência...');
    const [existingUser] = await this.prisma.$queryRaw<
      Array<{ id: string }>
    >`SELECT "id" FROM public.users WHERE clerk_id = ${clerkUserId} LIMIT 1`;

    if (existingUser) {
      console.log(`[BACKEND] 🎉 Utilizador já registado localmente. ID Prisma: ${existingUser.id}`);
      return this.getSelfProfile(existingUser.id);
    }

    console.log('[BACKEND] 🆕 Utilizador em falta na BD local. Solicitando dados à API do Clerk...');

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

      console.log(`[BACKEND] 📝 Executando INSERT Raw na tabela public.users (Name: "${name}", Email: "${email}")`);
      
      // Create new user
      const [createdUser] = await this.prisma.$queryRaw<Array<{ id: string }>>`
        INSERT INTO public.users (clerk_id, email, username, name, role, password_hash)
        VALUES (${clerkUserId}, ${email}, ${username}, ${name}, 'user', '')
        RETURNING "id"
      `;

      console.log(`[BACKEND] ✅ Utilizador inserido com sucesso via SQL Raw! Novo ID: ${createdUser.id}`);
      return this.getSelfProfile(createdUser.id);
    } catch (error: unknown) {
      console.log('❌ [BACKEND ERRO] O pipeline de criação falhou:', error);

      // If Clerk API is rate-limited or unavailable, create a stub user
      if (isClerkRateLimitError(error)) {
        console.log('[BACKEND] ⚠️ Clerk API Rate Limited. Criando utilizador Stub...');
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
    console.log(`[BACKEND] 🔑 Rota /auth/me intercetada para o Clerk ID: ${clerkId}`);
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