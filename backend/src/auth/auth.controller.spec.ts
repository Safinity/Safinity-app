/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

interface MockRequest {
  user: { clerk_id: string };
}

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

  describe('GET /auth/me', () => {
    it('should return authenticated user profile', async () => {
      const mockUser = {
        id: 'user_123',
        clerk_id: 'clerk_123',
        name: 'João Silva',
        email: 'joao@example.com',
        username: 'joao123',
        image: null,
        role: 'user',
        emergency_contact: null,
        created_at: new Date(),
        updated_at: new Date(),
        user_tickets: [],
        user_favorites: [],
      };

      jest.mocked(service.getAuthenticatedProfile).mockResolvedValue(mockUser);

      const req: MockRequest = {
        user: { clerk_id: 'clerk_123' },
      };

      const result = await controller.me(req as never);

      expect(result.email).toBe('joao@example.com');
      expect(jest.mocked(service.getAuthenticatedProfile)).toHaveBeenCalledWith(
        'clerk_123',
      );
    });

    it('should propagate service errors', async () => {
      jest
        .mocked(service.getAuthenticatedProfile)
        .mockRejectedValue(new Error('User not found'));

      const req: MockRequest = {
        user: { clerk_id: 'clerk_invalid' },
      };

      await expect(controller.me(req as never)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
