import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NotificationsRealtimeService } from '../notifications/notifications-realtime.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSosDto } from './dto/create-sos.dto';

@Injectable()
export class SosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: NotificationsRealtimeService,
  ) {}

  async create(input: CreateSosDto, userId: string) {
    const optionsJson = input.options ? JSON.stringify(input.options) : null;

    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const sosId = await this.nextSosId(tx);
      const alertId = await this.nextAlertId(tx);

      const sosRows = await tx.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`
          INSERT INTO sos (id, user_id, location, description, tag_selected, options)
          VALUES (
            ${sosId},
            ${Prisma.sql`${userId}::uuid`},
            ST_SetSRID(ST_MakePoint(${input.location.lng}, ${input.location.lat}), 4326)::geography,
            ${input.description ?? null},
            ${input.tag_selected ?? null},
            ${optionsJson}::jsonb
          )
          RETURNING id, user_id, description, tag_selected, options, time
        `,
      );

      await tx.$executeRaw(
        Prisma.sql`
          INSERT INTO alerts (id, sos_id)
          VALUES (${alertId}, ${sosId})
        `,
      );

      const notificationResults = await this.createFriendSosNotifications(
        tx,
        userId,
      );

      return {
        sosRows,
        notificationResults,
      };
    });

    result.notificationResults.forEach(({ notification, targetUserIds }) => {
      this.realtime.emitNotificationCreatedForUsers(
        targetUserIds,
        notification,
      );
    });

    return result.sosRows;
  }

  private async createFriendSosNotifications(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<
    Array<{
      notification: { id: bigint; event_id: bigint | null };
      targetUserIds: string[];
    }>
  > {
    const activeTickets = await tx.user_tickets.findMany({
      where: {
        user_id: userId,
        event: { status: { equals: 'active', mode: 'insensitive' } },
      },
      select: { event_id: true },
    });
    const activeEventIds = activeTickets.map((ticket) => ticket.event_id);

    if (activeEventIds.length === 0) {
      return [];
    }

    const targetGroups = await this.findFriendSosTargets(
      tx,
      userId,
      activeEventIds,
    );

    if (targetGroups.length === 0) {
      return [];
    }

    const sender = await tx.users.findUnique({
      where: { id: userId },
      select: { name: true, username: true },
    });
    const senderName = sender?.name || sender?.username || 'A friend';
    let notificationId = await this.nextNotificationId(tx);
    let nextStatusId = await this.nextNotificationStatusId(tx);
    const results: Array<{
      notification: { id: bigint; event_id: bigint | null };
      targetUserIds: string[];
    }> = [];

    for (const group of targetGroups) {
      const notification = await tx.notifications.create({
        data: {
          id: notificationId++,
          event_id: group.eventId,
          title: 'Friend SOS alert',
          description: `${senderName} sent an SOS request at this event.`,
          category: 'friend_sos',
        },
        select: { id: true, event_id: true },
      });

      await tx.user_notification_status.createMany({
        data: group.targetUserIds.map((targetUserId) => ({
          id: nextStatusId++,
          user_id: targetUserId,
          notification_id: notification.id,
          read_at: null,
        })),
        skipDuplicates: true,
      });

      results.push({ notification, targetUserIds: group.targetUserIds });
    }

    return results;
  }

  private async findFriendSosTargets(
    tx: Prisma.TransactionClient,
    userId: string,
    activeEventIds: bigint[],
  ): Promise<
    Array<{
      eventId: bigint;
      targetUserIds: string[];
    }>
  > {
    const friendships = await tx.friendship.findMany({
      where: {
        state: { in: ['ACCEPTED', 'accepted'] },
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
      select: { user1_id: true, user2_id: true },
    });
    const friendIds = friendships
      .map((friendship) =>
        friendship.user1_id === userId
          ? friendship.user2_id
          : friendship.user1_id,
      )
      .filter((friendId): friendId is string => Boolean(friendId));

    if (friendIds.length === 0) {
      return [];
    }

    const ticketedFriends = await tx.user_tickets.findMany({
      where: {
        event_id: { in: activeEventIds },
        user_id: { in: friendIds },
      },
      select: { event_id: true, user_id: true },
    });
    const targetsByEventId = new Map<string, Set<string>>();

    ticketedFriends.forEach((ticket) => {
      const eventKey = ticket.event_id.toString();
      const currentTargets = targetsByEventId.get(eventKey) ?? new Set<string>();
      currentTargets.add(ticket.user_id);
      targetsByEventId.set(eventKey, currentTargets);
    });

    return [...targetsByEventId.entries()].map(([eventId, targetUserIds]) => ({
      eventId: BigInt(eventId),
      targetUserIds: [...targetUserIds],
    }));
  }

  private async nextSosId(tx: Prisma.TransactionClient): Promise<bigint> {
    const result = await tx.sos.aggregate({
      _max: { id: true },
    });

    return (result._max.id ?? BigInt(0)) + BigInt(1);
  }

  private async nextAlertId(tx: Prisma.TransactionClient): Promise<bigint> {
    const result = await tx.$queryRaw<Array<{ next_id: bigint }>>(
      Prisma.sql`SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM alerts`,
    );

    return result[0]?.next_id ?? BigInt(1);
  }

  private async nextNotificationId(
    tx: Prisma.TransactionClient,
  ): Promise<bigint> {
    const result = await tx.notifications.aggregate({
      _max: { id: true },
    });

    return (result._max.id ?? BigInt(0)) + BigInt(1);
  }

  private async nextNotificationStatusId(
    tx: Prisma.TransactionClient,
  ): Promise<bigint> {
    const result = await tx.user_notification_status.aggregate({
      _max: { id: true },
    });

    return (result._max.id ?? BigInt(0)) + BigInt(1);
  }
}