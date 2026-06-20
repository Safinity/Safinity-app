/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AddFriendFromQrDto } from './dto/add-friend-from-qr.dto';
import type { RequestWithUser } from '../auth/auth.types';

describe('FriendsController', () => {
  let controller: FriendsController;
  let service: FriendsService;

  const mockRequest = {
    user: { id: 'user-id-123' },
  } as unknown as RequestWithUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendsController],
      providers: [
        {
          provide: FriendsService,
          useValue: {
            getFriendsGroupedByEvent: jest.fn(),
            searchUsers: jest.fn(),
            toggleFriendship: jest.fn(),
            acceptFriendship: jest.fn(),
            buzzFriend: jest.fn(),
            getFriendProfile: jest.fn(),
            getPendingRequests: jest.fn(),
            getFriendQrCode: jest.fn(),
            previewFriendFromQrCode: jest.fn(),
            addFriendFromQrCode: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FriendsController>(FriendsController);
    service = module.get<FriendsService>(FriendsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should call getFriendsGroupedByEvent with correct params', async () => {
      const mockResult = { onSameEvent: [], otherFriends: [] };
      jest
        .mocked(service.getFriendsGroupedByEvent)
        .mockResolvedValue(mockResult);

      const result = await controller.getAll(
        mockRequest,
        '1',
        '20',
        'alex',
        'true',
        'name',
        'asc',
      );

      expect(result).toEqual(mockResult);
      expect(service.getFriendsGroupedByEvent).toHaveBeenCalledWith(
        'user-id-123',
        {
          page: '1',
          pageSize: '20',
          search: 'alex',
          inEvent: 'true',
          sortBy: 'name',
          sortOrder: 'asc',
        },
      );
    });
  });

  describe('search', () => {
    it('should call searchUsers with correct params', async () => {
      jest.mocked(service.searchUsers).mockResolvedValue([]);

      await controller.search('alex', mockRequest, '1', '10');

      expect(service.searchUsers).toHaveBeenCalledWith('user-id-123', {
        query: 'alex',
        page: '1',
        pageSize: '10',
        sortBy: undefined,
        sortOrder: undefined,
      });
    });
  });

  describe('toggle', () => {
    it('should call toggleFriendship', async () => {
      jest
        .mocked(service.toggleFriendship)
        .mockResolvedValue({ id: 1n } as any);

      await controller.toggle('friend-456', mockRequest);

      expect(service.toggleFriendship).toHaveBeenCalledWith(
        'user-id-123',
        'friend-456',
      );
    });
  });

  describe('accept', () => {
    it('should call acceptFriendship', async () => {
      jest
        .mocked(service.acceptFriendship)
        .mockResolvedValue({ id: 1n } as any);

      await controller.accept('friend-456', mockRequest);

      expect(service.acceptFriendship).toHaveBeenCalledWith(
        'user-id-123',
        'friend-456',
      );
    });
  });

  describe('buzzFriend', () => {
    it('should call buzzFriend', async () => {
      jest.mocked(service.buzzFriend).mockResolvedValue({ sent: true } as any);

      await controller.buzzFriend('friend-456', mockRequest);

      expect(service.buzzFriend).toHaveBeenCalledWith(
        'user-id-123',
        'friend-456',
      );
    });
  });

  describe('getProfile', () => {
    it('should return friend profile details', async () => {
      const mockProfile = {
        id: 'friend-456',
        name: 'Friend',
        commonEvents: [],
      };
      jest
        .mocked(service.getFriendProfile)
        .mockResolvedValue(mockProfile as any);

      const result = await controller.getProfile('friend-456', mockRequest);

      expect(result).toEqual(mockProfile);
    });
  });

  describe('getPending', () => {
    it('should get pending requests', async () => {
      jest.mocked(service.getPendingRequests).mockResolvedValue([]);

      await controller.getPending(mockRequest);

      expect(service.getPendingRequests).toHaveBeenCalledWith('user-id-123');
    });
  });

  describe('QR Code Operations', () => {
    it('should get my qr code payload', async () => {
      jest
        .mocked(service.getFriendQrCode)
        .mockResolvedValue({ payload: '{}', user: {} as any });

      await controller.getMyQrCode(mockRequest);

      expect(service.getFriendQrCode).toHaveBeenCalledWith('user-id-123');
    });

    it('should preview friend from QR code', async () => {
      const dto: AddFriendFromQrDto = { payload: 'qr-payload' };
      jest
        .mocked(service.previewFriendFromQrCode)
        .mockResolvedValue({ friend: {} as any });

      await controller.previewFromQrCode(dto, mockRequest);

      expect(service.previewFriendFromQrCode).toHaveBeenCalledWith(
        'user-id-123',
        dto,
      );
    });

    it('should add friend from QR code', async () => {
      const dto: AddFriendFromQrDto = { payload: 'qr-payload' };
      jest
        .mocked(service.addFriendFromQrCode)
        .mockResolvedValue({ state: 'ACCEPTED' } as any);

      await controller.addFromQrCode(dto, mockRequest);

      expect(service.addFriendFromQrCode).toHaveBeenCalledWith(
        'user-id-123',
        dto,
      );
    });
  });
});
