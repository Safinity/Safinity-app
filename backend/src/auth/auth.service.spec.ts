/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkService } from './clerk.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let clerkService: ClerkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            users: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $queryRaw: jest.fn(),
            $transaction: jest.fn(),
          },
        },
        {
          provide: ClerkService,
          useValue: {
            client: {
              users: {
                getUser: jest.fn(),
                deleteUser: jest.fn(),
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    clerkService = module.get<ClerkService>(ClerkService);
  });

  describe('findOrCreateUser', () => {
    it('should return existing user', async () => {
      const clerkId = 'clerk_123';
      const userId = 'user_123';

      jest.mocked(prisma.$queryRaw).mockResolvedValue([{ id: userId }]);
      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        id: userId,
        clerk_id: clerkId,
        name: 'Beatriz Castro',
        email: 'beatriz@example.com',
        username: 'beatriz123',
        image: null,
        role: 'user',
        emergency_contact: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await service.findOrCreateUser(clerkId);

      expect(result.clerk_id).toBe(clerkId);
    });

    it('should create new user from Clerk', async () => {
      const clerkId = 'clerk_new';
      const userId = 'user_new';

      jest
        .mocked(prisma.$queryRaw)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: userId }]);

      jest.mocked(clerkService.client.users.getUser).mockResolvedValue({
        id: clerkId,
        firstName: 'André',
        lastName: 'Dora',
        emailAddresses: [{ emailAddress: 'andre@example.com' }],
        username: 'andre123',
      } as never);

      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        id: userId,
        clerk_id: clerkId,
        name: 'André Dora',
        email: 'andre@example.com',
        username: 'andre123',
        image: null,
        role: 'user',
        emergency_contact: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await service.findOrCreateUser(clerkId);

      expect(result.name).toBe('André Dora');
    });
  });

  describe('updateProfile', () => {
    it('should throw if username already in use', async () => {
      const userId = 'user_123';
      const body = { username: 'taken_username' };

      jest.mocked(prisma.users.findFirst).mockResolvedValue({
        id: 'other_user',
      });

      await expect(service.updateProfile(userId, body)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      const userId = 'user_123';
      const clerkId = 'clerk_123';

      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        id: userId,
        clerk_id: clerkId,
      });

      jest.mocked(prisma.$transaction).mockResolvedValue(null);
      jest
        .mocked(clerkService.client.users.deleteUser)
        .mockResolvedValue({} as never);

      const result = await service.deleteAccount(userId);

      expect(result.message).toBe('Account deleted successfully.');
    });

    it('should throw if user not found', async () => {
      jest.mocked(prisma.users.findUnique).mockResolvedValue(null);

      await expect(service.deleteAccount('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
