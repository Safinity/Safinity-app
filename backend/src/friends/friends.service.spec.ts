/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { FriendsService } from './friends.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsRealtimeService } from '../notifications/notifications-realtime.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('FriendsService', () => {
  let service: FriendsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        {
          provide: PrismaService,
          useValue: {
            $executeRaw: jest.fn().mockResolvedValue(0),
            $queryRaw: jest.fn().mockResolvedValue([]),
            users: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
            friendship: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            user_tickets: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: NotificationsRealtimeService,
          useValue: {
            emitFriendshipUpdated: jest.fn(),
            emitFriendRequest: jest.fn(),
            emitFriendBuzz: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFriendsGroupedByEvent', () => {
    it('should return empty grouping if no friendships exist', async () => {
      jest.mocked(prisma.user_tickets.findMany).mockResolvedValue([]);
      jest.mocked(prisma.friendship.findMany).mockResolvedValue([]);

      const result = await service.getFriendsGroupedByEvent('user-1');

      expect(result.onSameEvent).toHaveLength(0);
      expect(result.otherFriends).toHaveLength(0);
    });

    it('groups, filters, sorts and paginates accepted friends', async () => {
      jest
        .mocked(prisma.user_tickets.findMany)
        .mockResolvedValue([{ event_id: 10n }] as any);
      jest.mocked(prisma.friendship.findMany).mockResolvedValue([
        {
          user1_id: 'user-1',
          users_friendship_user2_idTousers: {
            id: 'user-2',
            name: 'Bea',
            username: 'bea',
            image: 'https://img/bea.jpg',
            user_tickets: [{ event_id: 10n }],
          },
        },
        {
          user1_id: 'user-3',
          users_friendship_user1_idTousers: {
            id: 'user-3',
            name: 'Alex',
            username: 'alex',
            image: 'invalid',
            user_tickets: [],
          },
        },
        { user1_id: 'user-1', users_friendship_user2_idTousers: null },
      ] as any);
      const result = await service.getFriendsGroupedByEvent('user-1', {
        search: 'be',
        inEvent: 'true',
        sortBy: 'username',
        sortOrder: 'desc',
        page: 'invalid',
        pageSize: '200',
      });
      expect(result.onSameEvent).toHaveLength(1);
      expect(result.onSameEvent[0].image).toBe('https://img/bea.jpg');
      expect(result.otherFriends).toHaveLength(0);
    });
  });

  describe('searchUsers', () => {
    it('should query and map found users without existing friendships', async () => {
      jest
        .mocked(prisma.users.findMany)
        .mockResolvedValue([
          { id: 'user-2', name: 'Alex', username: 'alex1', image: null },
        ] as any);
      jest.mocked(prisma.friendship.findMany).mockResolvedValue([]);

      const result = await service.searchUsers('user-1', { query: 'Alex' });

      expect(result).toHaveLength(1);
      expect(result[0].friendshipState).toBeNull();
    });
  });

  describe('getFriendQrCode', () => {
    it('should throw NotFoundException if authenticated user does not exist', async () => {
      jest.mocked(prisma.users.findUnique).mockResolvedValue(null);

      await expect(service.getFriendQrCode('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should generate a valid JSON payload string containing type and userId', async () => {
      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        id: 'user-1',
        name: 'User One',
        username: 'user1',
        image: null,
      } as any);

      const result = await service.getFriendQrCode('user-1');

      expect(result.payload).toContain('safinity.friend');
      expect(result.user.id).toBe('user-1');
    });
  });

  describe('toggleFriendship', () => {
    it('should delete friendship if connection already exists', async () => {
      const mockFriendship = {
        id: 123n,
        user1_id: 'user-1',
        user2_id: 'user-2',
        state: 'PENDING',
      };
      jest
        .mocked(prisma.friendship.findFirst)
        .mockResolvedValue(mockFriendship);
      jest.mocked(prisma.friendship.delete).mockResolvedValue(mockFriendship);

      const result = await service.toggleFriendship('user-1', 'user-2');

      expect(prisma.friendship.delete).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should create a PENDING friendship if no history exists', async () => {
      jest.mocked(prisma.friendship.findFirst).mockResolvedValue(null);
      jest.mocked(prisma.friendship.create).mockResolvedValue({
        id: 999n,
        user1_id: 'user-1',
        user2_id: 'user-2',
        state: 'PENDING',
      });

      const result = await service.toggleFriendship('user-1', 'user-2');

      expect(result.state).toBe('PENDING');
    });
  });

  describe('previewFriendFromQrCode', () => {
    it('should throw BadRequestException if user targets themselves', async () => {
      await expect(
        service.previewFriendFromQrCode('user-1', { userId: 'user-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('parses JSON, URL and direct user ids', async () => {
      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: null,
        username: null,
        image: 'invalid',
      } as any);
      await expect(
        service.previewFriendFromQrCode('user-1', {
          payload: JSON.stringify({
            type: 'safinity.friend',
            userId: '123e4567-e89b-12d3-a456-426614174000',
          }),
        }),
      ).resolves.toMatchObject({ friend: { image: null } });
      await service.previewFriendFromQrCode('user-1', {
        payload:
          'https://safinity.app/add?friendId=123e4567-e89b-12d3-a456-426614174000',
      });
      await service.previewFriendFromQrCode('user-1', {
        payload: '123e4567-e89b-12d3-a456-426614174000',
      });
    });

    it('rejects invalid QR data and missing friends', async () => {
      await expect(
        service.previewFriendFromQrCode('user-1', {}),
      ).rejects.toThrow('QR payload or userId is required');
      await expect(
        service.previewFriendFromQrCode('user-1', { payload: 'not valid' }),
      ).rejects.toThrow('Invalid friend QR payload');
      jest.mocked(prisma.users.findUnique).mockResolvedValue(null);
      await expect(
        service.previewFriendFromQrCode('user-1', { userId: 'user-2' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addFriendFromQrCode', () => {
    it('creates or accepts a friendship and serializes its id', async () => {
      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        id: 'user-2',
        name: 'Friend',
        username: 'friend',
        image: null,
      } as any);
      jest.mocked(prisma.friendship.findFirst).mockResolvedValueOnce(null);
      jest.mocked(prisma.friendship.create).mockResolvedValue({
        id: 5n,
        state: 'ACCEPTED',
      } as any);
      await expect(
        service.addFriendFromQrCode('user-1', { userId: 'user-2' }),
      ).resolves.toMatchObject({ state: 'ACCEPTED', friendshipId: '5' });

      jest
        .mocked(prisma.friendship.findFirst)
        .mockResolvedValue({ id: 5n } as any);
      jest.mocked(prisma.friendship.update).mockResolvedValue({
        id: 5n,
        state: 'ACCEPTED',
      } as any);
      await expect(
        service.addFriendFromQrCode('user-1', { userId: 'user-2' }),
      ).resolves.toMatchObject({ state: 'ACCEPTED' });
    });

    it('rejects self-addition and missing users', async () => {
      await expect(
        service.addFriendFromQrCode('user-1', { userId: 'user-1' }),
      ).rejects.toThrow(BadRequestException);
      jest.mocked(prisma.users.findUnique).mockResolvedValue(null);
      await expect(
        service.addFriendFromQrCode('user-1', { userId: 'missing' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('acceptFriendship', () => {
    it('should throw NotFoundException if no matching pending record exists', async () => {
      jest.mocked(prisma.friendship.findFirst).mockResolvedValue(null);

      await expect(
        service.acceptFriendship('user-1', 'user-2'),
      ).rejects.toThrow(NotFoundException);
    });

    it('accepts a pending request', async () => {
      jest
        .mocked(prisma.friendship.findFirst)
        .mockResolvedValue({ id: 8n } as any);
      jest.mocked(prisma.friendship.update).mockResolvedValue({
        id: 8n,
        state: 'ACCEPTED',
      } as any);
      await expect(
        service.acceptFriendship('user-1', 'user-2'),
      ).resolves.toMatchObject({
        state: 'ACCEPTED',
      });
    });
  });

  describe('buzzFriend', () => {
    it('validates the recipient and active friendship', async () => {
      await expect(service.buzzFriend('user-1', 'user-1')).rejects.toThrow(
        'You cannot buzz yourself',
      );
      jest.mocked(prisma.friendship.findFirst).mockResolvedValue(null);
      await expect(service.buzzFriend('user-1', 'user-2')).rejects.toThrow(
        'accepted friends',
      );
    });

    it('sends realtime and push buzzes to a friend at the same event', async () => {
      jest
        .mocked(prisma.friendship.findFirst)
        .mockResolvedValue({ id: 1n } as any);
      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        id: 'user-1',
        name: 'Andre',
        username: 'andre',
      } as any);
      jest
        .mocked(prisma.user_tickets.findFirst)
        .mockResolvedValue({ event_id: 10n } as any);
      jest
        .mocked(prisma.$queryRaw)
        .mockResolvedValue([{ token: 'ExponentPushToken[x]' }]);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [{ status: 'ok' }] }),
      } as any) as any;
      await expect(service.buzzFriend('user-1', 'user-2')).resolves.toEqual({
        sent: true,
        friendId: 'user-2',
        eventId: '10',
      });
      expect(prisma.$executeRaw).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('rejects missing senders and users outside a shared event', async () => {
      jest
        .mocked(prisma.friendship.findFirst)
        .mockResolvedValue({ id: 1n } as any);
      jest.mocked(prisma.users.findUnique).mockResolvedValue(null);
      jest.mocked(prisma.user_tickets.findFirst).mockResolvedValue(null);
      await expect(service.buzzFriend('user-1', 'user-2')).rejects.toThrow(
        'Authenticated user not found',
      );
      jest
        .mocked(prisma.users.findUnique)
        .mockResolvedValue({ id: 'user-1' } as any);
      await expect(service.buzzFriend('user-1', 'user-2')).rejects.toThrow(
        'same active event',
      );
    });
  });

  it('maps pending friend requests', async () => {
    jest.mocked(prisma.friendship.findMany).mockResolvedValue([
      {
        id: 3n,
        users_friendship_user1_idTousers: {
          id: 'user-2',
          name: 'Friend',
          username: 'friend',
          image: 'bad',
        },
      },
    ] as any);
    await expect(service.getPendingRequests('user-1')).resolves.toEqual([
      {
        id: '3',
        sender: {
          id: 'user-2',
          name: 'Friend',
          username: 'friend',
          image: null,
        },
      },
    ]);
  });

  it('builds a friend profile with common events', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue({
      id: 'user-2',
      name: null,
      username: null,
      image: null,
      user_tickets: [
        { event_id: 10n, event: { id: 10n } },
        { event_id: 20n, event: { id: 20n } },
      ],
    } as any);
    jest
      .mocked(prisma.user_tickets.findMany)
      .mockResolvedValue([{ event_id: 10n }] as any);
    jest
      .mocked(prisma.friendship.findFirst)
      .mockResolvedValue({ state: 'ACCEPTED' } as any);
    await expect(
      service.getFriendProfile('user-1', 'user-2'),
    ).resolves.toMatchObject({
      friendshipState: 'ACCEPTED',
      totalEventsCount: 2,
      commonEvents: [{ id: 10n }],
    });
    jest.mocked(prisma.users.findUnique).mockResolvedValue(null);
    await expect(service.getFriendProfile('user-1', 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
