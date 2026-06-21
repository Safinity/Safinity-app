/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/unbound-method */
import { WebSocket } from 'ws';
import { NotificationsRealtimeService } from './notifications-realtime.service';

describe('NotificationsRealtimeService', () => {
  const authService = { findOrCreateUser: jest.fn() };
  const prisma = { user_tickets: { findMany: jest.fn() } };
  let service: NotificationsRealtimeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationsRealtimeService(
      authService as never,
      prisma as never,
    );
  });

  const connectedSocket = () =>
    ({ readyState: WebSocket.OPEN, send: jest.fn() }) as unknown as WebSocket;

  it('sends event notifications once to each ticketed user', async () => {
    const first = connectedSocket();
    const second = connectedSocket();
    (service as any).addClient({ socket: first, userId: 'u1' });
    (service as any).addClient({ socket: second, userId: 'u2' });
    prisma.user_tickets.findMany.mockResolvedValue([
      { user_id: 'u1' },
      { user_id: 'u1' },
      { user_id: 'u2' },
    ]);

    await service.emitNotificationCreated({ id: 7n, event_id: 3n });
    expect(first.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'notification.created',
        notificationId: '7',
        eventId: '3',
      }),
    );
    expect(second.send).toHaveBeenCalledTimes(1);
  });

  it('ignores notifications without an event', async () => {
    await service.emitNotificationCreated({ id: 1n, event_id: null });
    expect(prisma.user_tickets.findMany).not.toHaveBeenCalled();
  });

  it('emits every supported realtime payload', () => {
    const socket = connectedSocket();
    (service as any).addClient({ socket, userId: 'target' });

    service.emitNotificationCreatedForUsers(['target', 'target'], {
      id: 2n,
      event_id: null,
    });
    service.emitFriendBuzz('target', {
      id: 'sender',
      name: null,
      username: 'andre',
    });
    service.emitReadAll('target');
    service.emitFriendRequest('target', 'friendship-1');
    service.emitFriendshipUpdated([null, 'target', undefined]);

    expect(socket.send).toHaveBeenCalledTimes(5);
    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'friend.buzz',
        senderId: 'sender',
        senderName: 'andre',
      }),
    );
  });

  it('does not send to missing or closed clients', () => {
    const socket = {
      readyState: WebSocket.CLOSED,
      send: jest.fn(),
    } as unknown as WebSocket;
    (service as any).addClient({ socket, userId: 'closed' });
    service.emitReadAll('closed');
    service.emitReadAll('missing');
    expect(socket.send).not.toHaveBeenCalled();
  });

  it('removes clients and deletes empty user sets', () => {
    const socket = connectedSocket();
    const client = { socket, userId: 'u1' };
    (service as any).removeClient(client);
    (service as any).addClient(client);
    (service as any).removeClient(client);
    expect((service as any).clients.has('u1')).toBe(false);
  });

  it('parses tokens from socket URLs', () => {
    expect((service as any).getTokenFromUrl()).toBeNull();
    expect((service as any).getTokenFromUrl('/path')).toBeNull();
    expect((service as any).getTokenFromUrl('/path?token=abc')).toBe('abc');
  });

  it('only attaches a websocket server once', () => {
    const fakeServer = { on: jest.fn() };
    (service as any).server = fakeServer;
    service.attach({} as never);
    expect(fakeServer.on).not.toHaveBeenCalled();
  });
});
