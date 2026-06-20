/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import type { RequestWithUser } from '../auth/auth.types';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockRequest = {
    user: { id: 'user-uuid-123', clerk_id: 'clerk-id-456' },
  } as unknown as RequestWithUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getAuthenticatedProfile: jest.fn(),
            updateProfile: jest.fn(),
            deleteAccount: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            updateMyLocation: jest.fn(),
            registerPushToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should call authService.getAuthenticatedProfile with clerk_id', async () => {
      jest
        .mocked(authService.getAuthenticatedProfile)
        .mockResolvedValue({ id: 'user-uuid-123' } as any);

      const result = await controller.getMe(mockRequest);

      expect(authService.getAuthenticatedProfile).toHaveBeenCalledWith(
        'clerk-id-456',
      );
      expect(result).toBeDefined();
    });
  });

  describe('updateProfile', () => {
    it('should call authService.updateProfile with payload', async () => {
      const dto: UpdateProfileDto = { name: 'Beatriz' };
      jest
        .mocked(authService.updateProfile)
        .mockResolvedValue({ success: true } as any);

      await controller.updateProfile(mockRequest, dto);

      expect(authService.updateProfile).toHaveBeenCalledWith(
        'user-uuid-123',
        dto,
      );
    });
  });

  describe('updateMyLocation', () => {
    it('should call usersService.updateMyLocation with lat and lng', async () => {
      const body = { lat: 40.6443, lng: -8.6455 };
      jest
        .mocked(usersService.updateMyLocation)
        .mockResolvedValue({ id: '1' } as any);

      await controller.updateMyLocation(mockRequest, body);

      expect(usersService.updateMyLocation).toHaveBeenCalledWith(
        'user-uuid-123',
        body,
      );
    });
  });

  describe('registerPushToken', () => {
    it('should call usersService.registerPushToken with token details', async () => {
      const body = { token: 'ExpoPushToken[xxx]', platform: 'ios' };
      jest
        .mocked(usersService.registerPushToken)
        .mockResolvedValue({ registered: true });

      await controller.registerPushToken(mockRequest, body);

      expect(usersService.registerPushToken).toHaveBeenCalledWith(
        'user-uuid-123',
        body,
      );
    });
  });

  describe('deleteAccount', () => {
    it('should call authService.deleteAccount', async () => {
      jest
        .mocked(authService.deleteAccount)
        .mockResolvedValue({ deleted: true } as any);

      await controller.deleteAccount(mockRequest);

      expect(authService.deleteAccount).toHaveBeenCalledWith('user-uuid-123');
    });
  });
});
