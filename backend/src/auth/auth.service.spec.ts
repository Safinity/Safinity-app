/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkService } from './clerk.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
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

    it('creates a stub user when Clerk is rate limited', async () => {
      jest
        .mocked(prisma.$queryRaw)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 'stub-id' }]);
      jest.mocked(clerkService.client.users.getUser).mockRejectedValue({
        status: 429,
      });
      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        id: 'stub-id',
        clerk_id: 'clerk-rate',
        name: null,
        username: null,
        email: null,
        image: 'not-a-url',
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      } as any);
      await expect(
        service.findOrCreateUser('clerk-rate'),
      ).resolves.toMatchObject({
        id: 'stub-id',
        image: null,
      });
    });

    it('rethrows non-rate-limit Clerk failures', async () => {
      jest.mocked(prisma.$queryRaw).mockResolvedValue([]);
      jest
        .mocked(clerkService.client.users.getUser)
        .mockRejectedValue(new Error('invalid Clerk token'));
      await expect(service.findOrCreateUser('bad')).rejects.toThrow(
        'invalid Clerk token',
      );
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

    it('rejects an empty update', async () => {
      await expect(service.updateProfile('user_123', {})).rejects.toThrow(
        'name, username or profile image is required',
      );
    });

    it('updates text profile fields and returns a safe image URL', async () => {
      jest.mocked(prisma.users.findFirst).mockResolvedValue(null);
      jest.mocked(prisma.users.update).mockResolvedValue({} as any);
      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        id: 'user_123',
        clerk_id: 'clerk_123',
        name: 'Andre',
        username: 'andre',
        email: 'andre@example.com',
        image: 'https://images.example/avatar.jpg',
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      } as any);
      await expect(
        service.updateProfile('user_123', {
          name: ' Andre ',
          username: ' andre ',
        }),
      ).resolves.toMatchObject({
        name: 'Andre',
        image: 'https://images.example/avatar.jpg',
      });
    });

    it('uploads a data URL image to Supabase', async () => {
      process.env.SUPABASE_URL = 'https://project.supabase.co///';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'secret';
      process.env.SUPABASE_PROFILE_BUCKET = 'profiles bucket';
      global.fetch = jest.fn().mockResolvedValue({ ok: true } as any) as any;
      jest.mocked(prisma.users.update).mockResolvedValue({} as any);
      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        id: 'user_123',
        clerk_id: 'clerk_123',
        name: 'Andre',
        username: 'andre',
        email: null,
        image: 'https://project.supabase.co/avatar.png',
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      } as any);
      await service.updateProfile('user_123', {
        imageBase64: `data:image/png;base64,${Buffer.from('image').toString('base64')}`,
        imageMimeType: 'image/png',
      });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          '/storage/v1/object/profiles bucket/User/Profile/',
        ),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('validates Supabase configuration and image types', async () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      await expect(
        service.updateProfile('u1', { imageBase64: 'aW1hZ2U=' }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);

      process.env.SUPABASE_URL = 'https://project.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'secret';
      await expect(
        service.updateProfile('u1', {
          imageBase64: 'aW1hZ2U=',
          imageMimeType: 'image/gif',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('reports failed Supabase uploads', async () => {
      process.env.SUPABASE_URL = 'https://project.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'secret';
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('storage denied'),
      } as any) as any;
      await expect(
        service.updateProfile('u1', { imageBase64: 'aW1hZ2U=' }),
      ).rejects.toThrow('storage denied');
    });
  });

  it('gets the authenticated profile and rejects a missing local profile', async () => {
    jest.mocked(prisma.$queryRaw).mockResolvedValue([{ id: 'u1' }]);
    jest
      .mocked(prisma.users.findUnique)
      .mockResolvedValueOnce({
        id: 'u1',
        clerk_id: 'clerk',
        name: null,
        username: null,
        email: null,
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      } as any)
      .mockResolvedValueOnce(null);
    await expect(
      service.getAuthenticatedProfile('clerk'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
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

    it('cleans related records before deleting the identities', async () => {
      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        id: 'user_123',
        clerk_id: 'clerk_123',
      });
      const tx: any = {
        user_tickets: {
          findMany: jest.fn().mockResolvedValue([{ ticket_code: 'T1' }]),
          deleteMany: jest.fn(),
        },
        sos: {
          findMany: jest.fn().mockResolvedValue([{ id: 3n }]),
          deleteMany: jest.fn(),
        },
        staff_details: {
          findUnique: jest.fn().mockResolvedValue({ id: 4n }),
          deleteMany: jest.fn(),
        },
        alerts: { deleteMany: jest.fn() },
        user_notification_status: { deleteMany: jest.fn() },
        user_favorites: { deleteMany: jest.fn() },
        friendship: { deleteMany: jest.fn() },
        user_locations: { deleteMany: jest.fn() },
        event_tickets_master: { updateMany: jest.fn() },
        users: { delete: jest.fn() },
      };
      jest
        .mocked(prisma.$transaction)
        .mockImplementation(async (callback: any) => callback(tx));
      jest
        .mocked(clerkService.client.users.deleteUser)
        .mockResolvedValue({} as never);
      await service.deleteAccount('user_123');
      expect(tx.alerts.deleteMany).toHaveBeenCalledTimes(2);
      expect(tx.event_tickets_master.updateMany).toHaveBeenCalled();
      expect(tx.users.delete).toHaveBeenCalledWith({
        where: { id: 'user_123' },
      });
    });

    it('should throw if user not found', async () => {
      jest.mocked(prisma.users.findUnique).mockResolvedValue(null);

      await expect(service.deleteAccount('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
