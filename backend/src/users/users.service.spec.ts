/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
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
              findFirst: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should throw NotFoundException if user profile does not exist', async () => {
      jest.mocked(prisma.users.findUnique).mockResolvedValue(null);

      await expect(service.getProfile('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return a serialized public profile if no viewer is specified', async () => {
      const mockRecord = {
        id: 'user-1',
        name: 'Ana',
        username: 'ana_safety',
        role: 'user',
        image: null,
        user_tickets: [],
        user_favorites: [],
      };

      jest.mocked(prisma.users.findUnique).mockResolvedValue(mockRecord as any);

      const profile = await service.getProfile('user-1');
      expect(profile.profile_mode).toBe('public');
      expect(profile).not.toHaveProperty('email');
    });
  });

  describe('getMyProfile', () => {
    it('should throw NotFoundException if no authenticating user is passed', async () => {
      await expect(service.getMyProfile(undefined)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findFriendsAtEvent', () => {
    it('should quickly return empty list if user has no friends records', async () => {
      jest.mocked(prisma.friendship.findMany).mockResolvedValue([]);

      const result = await service.findFriendsAtEvent('user-1', 500n);
      expect(result).toEqual([]);
    });
  });

  describe('updateMyLocation', () => {
    it('should throw BadRequestException if coordinates are out of global bounds', async () => {
      await expect(
        service.updateMyLocation('user-1', { lat: 120, lng: -45 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('registerPushToken', () => {
    it('should throw BadRequestException for plain formats or invalid notification tokens', async () => {
      await expect(
        service.registerPushToken('user-1', { token: 'invalid_token_format' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should safely accept and register valid Expo and Exponent tokens', async () => {
      jest
        .mocked(prisma.users.findUnique)
        .mockResolvedValue({ id: 'user-1' } as any);
      jest.mocked(prisma.$executeRaw).mockResolvedValue(1);

      const result = await service.registerPushToken('user-1', {
        token: 'ExpoPushToken[abcdef123456]',
        platform: 'android',
      });

      expect(result).toEqual({ registered: true });
    });
  });
});
