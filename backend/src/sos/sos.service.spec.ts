/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unnecessary-type-assertion */
import { NotFoundException } from '@nestjs/common';
import { SosService } from './sos.service';

describe('SosService', () => {
  const tx = {
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
    sos: { aggregate: jest.fn() },
    user_tickets: { findMany: jest.fn() },
    friendship: { findMany: jest.fn() },
    users: { findUnique: jest.fn() },
    notifications: { aggregate: jest.fn(), create: jest.fn() },
    user_notification_status: { aggregate: jest.fn(), createMany: jest.fn() },
  };
  const prisma = {
    users: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };
  const realtime = { emitNotificationCreatedForUsers: jest.fn() };
  let service: SosService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SosService(prisma as never, realtime as never);
    prisma.users.findUnique.mockResolvedValue({ id: 'sender' });
    prisma.$transaction.mockImplementation((callback: any) => callback(tx));
    tx.sos.aggregate.mockResolvedValue({ _max: { id: 4n } });
    tx.$queryRaw
      .mockResolvedValueOnce([{ next_id: 8n }])
      .mockResolvedValueOnce([{ id: 5n, user_id: 'sender' }]);
    tx.$executeRaw.mockResolvedValue(1);
    tx.user_tickets.findMany.mockResolvedValue([]);
  });

  it('rejects SOS creation for an unknown user', async () => {
    prisma.users.findUnique.mockResolvedValue(null);
    await expect(
      service.create({ location: { lat: 38.7, lng: -9.1 } } as any, 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('creates SOS and alert rows without notifications when no event is active', async () => {
    const result = await service.create(
      {
        location: { lat: 38.7, lng: -9.1 },
        description: 'Need help',
        tag_selected: 'medical',
        options: ['call'],
      } as any,
      'sender',
    );
    expect(result).toEqual([{ id: 5n, user_id: 'sender' }]);
    expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
    expect(realtime.emitNotificationCreatedForUsers).not.toHaveBeenCalled();
  });

  it('does not notify when the user has no accepted friends', async () => {
    tx.user_tickets.findMany.mockResolvedValueOnce([{ event_id: 10n }]);
    tx.friendship.findMany.mockResolvedValue([]);
    await service.create({ location: { lat: 1, lng: 2 } } as any, 'sender');
    expect(tx.notifications.create).not.toHaveBeenCalled();
  });

  it('does not notify when friends have no tickets for the active event', async () => {
    tx.user_tickets.findMany
      .mockResolvedValueOnce([{ event_id: 10n }])
      .mockResolvedValueOnce([]);
    tx.friendship.findMany.mockResolvedValue([
      { user1_id: 'sender', user2_id: 'friend' },
      { user1_id: null, user2_id: 'sender' },
    ]);
    await service.create({ location: { lat: 1, lng: 2 } } as any, 'sender');
    expect(tx.notifications.create).not.toHaveBeenCalled();
  });

  it('groups friends per event, creates notifications and emits realtime updates', async () => {
    tx.user_tickets.findMany
      .mockResolvedValueOnce([{ event_id: 10n }, { event_id: 20n }])
      .mockResolvedValueOnce([
        { event_id: 10n, user_id: 'friend-a' },
        { event_id: 10n, user_id: 'friend-a' },
        { event_id: 10n, user_id: 'friend-b' },
        { event_id: 20n, user_id: 'friend-b' },
      ]);
    tx.friendship.findMany.mockResolvedValue([
      { user1_id: 'sender', user2_id: 'friend-a' },
      { user1_id: 'friend-b', user2_id: 'sender' },
    ]);
    tx.users.findUnique.mockResolvedValue({ name: null, username: 'andre' });
    tx.notifications.aggregate.mockResolvedValue({ _max: { id: 30n } });
    tx.user_notification_status.aggregate.mockResolvedValue({
      _max: { id: 40n },
    });
    tx.notifications.create
      .mockResolvedValueOnce({ id: 31n, event_id: 10n })
      .mockResolvedValueOnce({ id: 32n, event_id: 20n });
    tx.user_notification_status.createMany.mockResolvedValue({ count: 3 });

    await service.create({ location: { lat: 1, lng: 2 } } as any, 'sender');

    expect(tx.notifications.create).toHaveBeenCalledTimes(2);
    expect(tx.notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 31n,
          event_id: 10n,
          description: expect.stringContaining('andre'),
        }),
      }),
    );
    expect(tx.user_notification_status.createMany).toHaveBeenCalledWith({
      data: [
        { id: 41n, user_id: 'friend-a', notification_id: 31n, read_at: null },
        { id: 42n, user_id: 'friend-b', notification_id: 31n, read_at: null },
      ],
      skipDuplicates: true,
    });
    expect(realtime.emitNotificationCreatedForUsers).toHaveBeenCalledTimes(2);
  });

  it('uses initial ids and fallback sender name when tables are empty', async () => {
    tx.sos.aggregate.mockResolvedValue({ _max: { id: null } });
    tx.$queryRaw
      .mockReset()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 1n }]);
    tx.user_tickets.findMany
      .mockResolvedValueOnce([{ event_id: 10n }])
      .mockResolvedValueOnce([{ event_id: 10n, user_id: 'friend' }]);
    tx.friendship.findMany.mockResolvedValue([
      { user1_id: 'sender', user2_id: 'friend' },
    ]);
    tx.users.findUnique.mockResolvedValue(null);
    tx.notifications.aggregate.mockResolvedValue({ _max: { id: null } });
    tx.user_notification_status.aggregate.mockResolvedValue({
      _max: { id: null },
    });
    tx.notifications.create.mockResolvedValue({ id: 1n, event_id: 10n });

    await service.create({ location: { lat: 1, lng: 2 } } as any, 'sender');
    expect(tx.notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 1n,
          description: expect.stringContaining('A friend'),
        }),
      }),
    );
  });
});
