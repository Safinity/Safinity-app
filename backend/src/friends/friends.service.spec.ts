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
        .mockResolvedValue(mockFriendship as any);
      jest
        .mocked(prisma.friendship.delete)
        .mockResolvedValue(mockFriendship as any);

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
      } as any);

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
  });

  describe('acceptFriendship', () => {
    it('should throw NotFoundException if no matching pending record exists', async () => {
      jest.mocked(prisma.friendship.findFirst).mockResolvedValue(null);

      await expect(
        service.acceptFriendship('user-1', 'user-2'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
