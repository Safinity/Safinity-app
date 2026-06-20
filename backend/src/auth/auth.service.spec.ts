import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkService } from './clerk.service';
import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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

      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ id: userId }]);
      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        clerk_id: clerkId,
        name: 'Beatriz Castro',
        email: 'beatriz@example.com',
        username: 'beatriz123',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      });

      const result = await service.findOrCreateUser(clerkId);

      expect(result.clerk_id).toBe(clerkId);
      expect(result.id).toBe(userId);
    });

    it('should create new user from Clerk', async () => {
      const clerkId = 'clerk_new';
      const userId = 'user_new';

      (prisma.$queryRaw as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: userId }]);

      (clerkService.client.users.getUser as jest.Mock).mockResolvedValue({
        id: clerkId,
        firstName: 'André',
        lastName: 'Dora',
        emailAddresses: [{ emailAddress: 'andre@example.com' }],
        username: 'andre123',
      });

      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        clerk_id: clerkId,
        name: 'André Dora',
        email: 'andre@example.com',
        username: 'andre123',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      });

      const result = await service.findOrCreateUser(clerkId);

      expect(result.name).toBe('André Dora');
      expect(result.email).toBe('andre@example.com');
    });
  });

  describe('getAuthenticatedProfile', () => {
    it('should return authenticated profile', async () => {
      const clerkId = 'clerk_123';

      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ id: 'user_123' }]);
      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_123',
        clerk_id: clerkId,
        name: 'Beatriz Castro',
        email: 'beatriz@example.com',
        username: 'beatriz123',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      });

      const result = await service.getAuthenticatedProfile(clerkId);

      expect(result.clerk_id).toBe(clerkId);
      expect(result.email).toBe('beatriz@example.com');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile with name', async () => {
      const userId = 'user_123';
      const body = { name: 'Beatriz Updated' };

      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        clerk_id: 'clerk_123',
        name: 'Beatriz Updated',
        email: 'beatriz@example.com',
        username: 'beatriz123',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      });

      const result = await service.updateProfile(userId, body);

      expect(result.name).toBe('Beatriz Updated');
      expect(prisma.users.update as jest.Mock).toHaveBeenCalled();
    });

    it('should update username if available', async () => {
      const userId = 'user_123';
      const body = { username: 'beatriz_updated' };

      (prisma.users.findFirst as jest.Mock).mockResolvedValue(null);

      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        clerk_id: 'clerk_123',
        name: 'Beatriz Castro',
        email: 'beatriz@example.com',
        username: 'beatriz_updated',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      });

      const result = await service.updateProfile(userId, body);

      expect(result.username).toBe('beatriz_updated');
    });

    it('should throw if username already in use', async () => {
      const userId = 'user_123';
      const body = { username: 'taken_username' };

      (prisma.users.findFirst as jest.Mock).mockResolvedValue({
        id: 'other_user',
      });

      await expect(service.updateProfile(userId, body)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if no data provided', async () => {
      const userId = 'user_123';
      const body = {};

      await expect(service.updateProfile(userId, body)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      const userId = 'user_123';
      const clerkId = 'clerk_123';

      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        clerk_id: clerkId,
      });

      (prisma.$transaction as jest.Mock).mockResolvedValue(null);

      (clerkService.client.users.deleteUser as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await service.deleteAccount(userId);

      expect(result.message).toBe('Account deleted successfully.');

      expect(
        clerkService.client.users.deleteUser as jest.Mock,
      ).toHaveBeenCalledWith(clerkId);
    });

    it('should throw if user not found', async () => {
      const userId = 'nonexistent';

      (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteAccount(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSelfProfile', () => {
    it('should return self profile', async () => {
      const userId = 'user_123';

      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        clerk_id: 'clerk_123',
        name: 'Beatriz Castro',
        email: 'beatriz@example.com',
        username: 'beatriz123',
        image: 'http://example.com/avatar.jpg',
        role: 'user',
        emergency_contact: '911',
        user_tickets: [],
        user_favorites: [],
      });

      const result = await service['getSelfProfile'](userId);

      expect(result.name).toBe('Beatriz Castro');
      expect(result.image).toBe('http://example.com/avatar.jpg');
    });

    it('should throw if user not found', async () => {
      (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service['getSelfProfile']('nonexistent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
