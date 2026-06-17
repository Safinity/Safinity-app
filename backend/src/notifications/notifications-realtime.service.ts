import { Injectable, Logger } from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import type { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';

type RealtimeClient = {
  socket: WebSocket;
  userId: string;
};

@Injectable()
export class NotificationsRealtimeService {
  private readonly logger = new Logger(NotificationsRealtimeService.name);
  private readonly clients = new Map<string, Set<WebSocket>>();
  private server: WebSocketServer | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  attach(httpServer: Server) {
    if (this.server) {
      return;
    }

    this.server = new WebSocketServer({
      server: httpServer,
      path: '/notifications/realtime',
    });

    this.server.on('connection', (socket, request) => {
      this.handleConnection(socket, request.url).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Rejected notifications socket: ${message}`);
        socket.close(1008, 'Authentication required');
      });
    });
  }

  async emitNotificationCreated(notification: {
    id: bigint;
    event_id: bigint | null;
  }) {
    if (!notification.event_id) {
      return;
    }

    const ticketedUsers = await this.prisma.user_tickets.findMany({
      where: { event_id: notification.event_id },
      select: { user_id: true },
    });
    const userIds = [...new Set(ticketedUsers.map((ticket) => ticket.user_id))];

    this.emitToUsers(userIds, {
      type: 'notification.created',
      notificationId: notification.id.toString(),
      eventId: notification.event_id.toString(),
    });
  }

  emitNotificationCreatedForUsers(
    userIds: string[],
    notification: { id: bigint; event_id: bigint | null },
  ) {
    this.emitToUsers([...new Set(userIds)], {
      type: 'notification.created',
      notificationId: notification.id.toString(),
      eventId: notification.event_id?.toString() ?? null,
    });
  }

  emitReadAll(userId: string) {
    this.emitToUsers([userId], { type: 'notifications.read_all' });
  }

  emitFriendRequest(userId: string, friendshipId: string) {
    this.emitToUsers([userId], {
      type: 'friend_request.created',
      friendshipId,
    });
  }

  emitFriendshipUpdated(userIds: Array<string | null | undefined>) {
    this.emitToUsers(
      userIds.filter((userId): userId is string => Boolean(userId)),
      { type: 'friendship.updated' },
    );
  }

  private async handleConnection(socket: WebSocket, requestUrl?: string) {
    const token = this.getTokenFromUrl(requestUrl);

    if (!token) {
      throw new Error('Missing token');
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const user = await this.authService.findOrCreateUser(payload.sub);
    const client: RealtimeClient = { socket, userId: user.id };
    this.addClient(client);

    socket.send(JSON.stringify({ type: 'notifications.connected' }));
    socket.on('close', () => this.removeClient(client));
    socket.on('error', () => this.removeClient(client));
  }

  private getTokenFromUrl(requestUrl?: string) {
    if (!requestUrl) {
      return null;
    }

    const url = new URL(requestUrl, 'http://localhost');
    return url.searchParams.get('token');
  }

  private addClient(client: RealtimeClient) {
    const currentClients =
      this.clients.get(client.userId) ?? new Set<WebSocket>();
    currentClients.add(client.socket);
    this.clients.set(client.userId, currentClients);
  }

  private removeClient(client: RealtimeClient) {
    const currentClients = this.clients.get(client.userId);

    if (!currentClients) {
      return;
    }

    currentClients.delete(client.socket);

    if (currentClients.size === 0) {
      this.clients.delete(client.userId);
    }
  }

  private emitToUsers(userIds: string[], payload: Record<string, unknown>) {
    const message = JSON.stringify(payload);

    for (const userId of userIds) {
      const currentClients = this.clients.get(userId);

      if (!currentClients) {
        continue;
      }

      for (const socket of currentClients) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(message);
        }
      }
    }
  }
}
