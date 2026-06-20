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

  // ✅ TESTE 1: Encontrar user existente
  describe('findOrCreateUser', () => {
    it('should return existing user', async () => {
      // ARRANGE
      const clerkId = 'clerk_123';
      const userId = 'user_123';

      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ id: userId }]);
      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        clerk_id: clerkId,
        name: 'João Silva',
        email: 'joao@example.com',
        username: 'joao123',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      });

      // ACT
      const result = await service.findOrCreateUser(clerkId);

      // ASSERT
      expect(result.clerk_id).toBe(clerkId);
      expect(result.id).toBe(userId);
    });

    it('should create new user from Clerk', async () => {
      // ARRANGE
      const clerkId = 'clerk_new';
      const userId = 'user_new';

      (prisma.$queryRaw as jest.Mock)
        .mockResolvedValueOnce([]) // First query - user not found
        .mockResolvedValueOnce([{ id: userId }]); // Second query - user created

      (clerkService.client.users.getUser as jest.Mock).mockResolvedValue({
        id: clerkId,
        firstName: 'Maria',
        lastName: 'Silva',
        emailAddresses: [{ emailAddress: 'maria@example.com' }],
        username: 'maria123',
      });

      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        clerk_id: clerkId,
        name: 'Maria Silva',
        email: 'maria@example.com',
        username: 'maria123',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      });

      // ACT
      const result = await service.findOrCreateUser(clerkId);

      // ASSERT
      expect(result.name).toBe('Maria Silva');
      expect(result.email).toBe('maria@example.com');
    });
  });

  // ✅ TESTE 2: Obter perfil autenticado
  describe('getAuthenticatedProfile', () => {
    it('should return authenticated profile', async () => {
      // ARRANGE
      const clerkId = 'clerk_123';

      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ id: 'user_123' }]);
      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_123',
        clerk_id: clerkId,
        name: 'João Silva',
        email: 'joao@example.com',
        username: 'joao123',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      });

      // ACT
      const result = await service.getAuthenticatedProfile(clerkId);

      // ASSERT
      expect(result.clerk_id).toBe(clerkId);
      expect(result.email).toBe('joao@example.com');
    });
  });

  // ✅ TESTE 3: Atualizar perfil
  describe('updateProfile', () => {
    it('should update user profile with name', async () => {
      // ARRANGE
      const userId = 'user_123';
      const body = { name: 'João Updated' };

      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        clerk_id: 'clerk_123',
        name: 'João Updated',
        email: 'joao@example.com',
        username: 'joao123',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      });

      // ACT
      const result = await service.updateProfile(userId, body);

      // ASSERT
      expect(result.name).toBe('João Updated');
      expect(prisma.users.update).toHaveBeenCalled();
    });

    it('should update username if available', async () => {
      // ARRANGE
      const userId = 'user_123';
      const body = { username: 'joao_updated' };

      (prisma.users.findFirst as jest.Mock).mockResolvedValue(null); // Username not taken
      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        clerk_id: 'clerk_123',
        name: 'João',
        email: 'joao@example.com',
        username: 'joao_updated',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      });

      // ACT
      const result = await service.updateProfile(userId, body);

      // ASSERT
      expect(result.username).toBe('joao_updated');
    });

    it('should throw if username already in use', async () => {
      // ARRANGE
      const userId = 'user_123';
      const body = { username: 'taken_username' };

      (prisma.users.findFirst as jest.Mock).mockResolvedValue({
        id: 'other_user',
      });

      // ACT & ASSERT
      await expect(service.updateProfile(userId, body)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if no data provided', async () => {
      // ARRANGE
      const userId = 'user_123';
      const body = {};

      // ACT & ASSERT
      await expect(service.updateProfile(userId, body)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ✅ TESTE 4: Deletar conta
  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      // ARRANGE
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

      // ACT
      const result = await service.deleteAccount(userId);

      // ASSERT
      expect(result.message).toBe('Account deleted successfully.');
      expect(clerkService.client.users.deleteUser).toHaveBeenCalledWith(
        clerkId,
      );
    });

    it('should throw if user not found', async () => {
      // ARRANGE
      const userId = 'nonexistent';

      (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);

      // ACT & ASSERT
      await expect(service.deleteAccount(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ✅ TESTE 5: getSelfProfile
  describe('getSelfProfile', () => {
    it('should return self profile', async () => {
      // ARRANGE
      const userId = 'user_123';

      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        clerk_id: 'clerk_123',
        name: 'João Silva',
        email: 'joao@example.com',
        username: 'joao123',
        image: 'http://example.com/avatar.jpg',
        role: 'user',
        emergency_contact: '911',
        user_tickets: [],
        user_favorites: [],
      });

      // ACT
      const result = await service['getSelfProfile'](userId);

      // ASSERT
      expect(result.name).toBe('João Silva');
      expect(result.image).toBe('http://example.com/avatar.jpg');
    });

    it('should throw if user not found', async () => {
      // ARRANGE
      (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);

      // ACT & ASSERT
      await expect(service['getSelfProfile']('nonexistent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
