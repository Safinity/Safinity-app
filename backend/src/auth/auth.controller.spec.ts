import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getAuthenticatedProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  // ✅ TESTE 1: GET /auth/me
  describe('GET /auth/me', () => {
    it('should return authenticated user profile', async () => {
      // ARRANGE
      const mockUser = {
        id: 'user_123',
        clerk_id: 'clerk_123',
        name: 'João Silva',
        email: 'joao@example.com',
        username: 'joao123',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      };

      (service.getAuthenticatedProfile as jest.Mock).mockResolvedValue(
        mockUser,
      );

      // ACT
      const result = await controller.me({
        user: { clerk_id: 'clerk_123' },
      } as any);

      // ASSERT
      expect(result.email).toBe('joao@example.com');
      expect(result.name).toBe('João Silva');
      expect(service.getAuthenticatedProfile).toHaveBeenCalledWith('clerk_123');
    });

    it('should call service with correct clerk_id', async () => {
      // ARRANGE
      const clerkId = 'clerk_abc';
      (service.getAuthenticatedProfile as jest.Mock).mockResolvedValue({
        id: 'user_123',
        clerk_id: clerkId,
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      });

      // ACT
      await controller.me({ user: { clerk_id: clerkId } } as any);

      // ASSERT
      expect(service.getAuthenticatedProfile).toHaveBeenCalledWith(clerkId);
    });

    it('should handle user with tickets', async () => {
      // ARRANGE
      const mockUser = {
        id: 'user_123',
        clerk_id: 'clerk_123',
        name: 'João Silva',
        email: 'joao@example.com',
        username: 'joao123',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [
          {
            event: {
              id: 'event_1',
              name: 'Music Festival 2024',
            },
          },
        ],
        user_favorites: [],
      };

      (service.getAuthenticatedProfile as jest.Mock).mockResolvedValue(
        mockUser,
      );

      // ACT
      const result = await controller.me({
        user: { clerk_id: 'clerk_123' },
      } as any);

      // ASSERT
      expect(result.user_tickets).toHaveLength(1);
      expect(result.user_tickets[0].event.name).toBe('Music Festival 2024');
    });

    it('should handle user with favorites', async () => {
      // ARRANGE
      const mockUser = {
        id: 'user_123',
        clerk_id: 'clerk_123',
        name: 'João Silva',
        email: 'joao@example.com',
        username: 'joao123',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [
          {
            activity: { id: 'act_1', name: 'Concert' },
          },
        ],
      };

      (service.getAuthenticatedProfile as jest.Mock).mockResolvedValue(
        mockUser,
      );

      // ACT
      const result = await controller.me({
        user: { clerk_id: 'clerk_123' },
      } as any);

      // ASSERT
      expect(result.user_favorites).toHaveLength(1);
    });
  });

  // ✅ TESTE 2: Validações gerais
  describe('General validations', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('service should be defined', () => {
      expect(service).toBeDefined();
    });

    it('me method should be defined', () => {
      expect(controller.me).toBeDefined();
    });

    it('should have correct endpoint', async () => {
      // Verifica que o método existe e é callable
      (service.getAuthenticatedProfile as jest.Mock).mockResolvedValue({
        id: 'user_123',
        clerk_id: 'clerk_123',
        name: 'Test',
        email: 'test@example.com',
        username: 'test',
        image: null,
        role: 'user',
        emergency_contact: null,
        user_tickets: [],
        user_favorites: [],
      });

      const result = await controller.me({
        user: { clerk_id: 'clerk_123' },
      } as any);
      expect(result).toBeDefined();
    });
  });

  // ✅ TESTE 3: Error handling
  describe('Error handling', () => {
    it('should propagate service errors', async () => {
      // ARRANGE
      (service.getAuthenticatedProfile as jest.Mock).mockRejectedValue(
        new Error('User not found'),
      );

      // ACT & ASSERT
      await expect(
        controller.me({ user: { clerk_id: 'clerk_invalid' } } as any),
      ).rejects.toThrow('User not found');
    });
  });
});
