/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { RequestWithUser } from '../auth/auth.types';
import { CreateOrganizationNotificationDto } from './dto/create-organization-notification.dto';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockRequest = {
    user: { id: 'user-uuid', roles: ['staff'] },
  } as unknown as RequestWithUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            findForTicketedEvents: jest.fn(),
            markAllRead: jest.fn(),
            findAll: jest.fn(),
            findByOrganizationEvent: jest.fn(),
            createForOrganizationEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyNotifications', () => {
    it('should forward user context to service', async () => {
      jest.mocked(service.findForTicketedEvents).mockResolvedValue([]);
      const result = await controller.getMyNotifications(mockRequest);
      expect(result).toEqual([]);
      expect(service.findForTicketedEvents).toHaveBeenCalledWith(
        mockRequest.user,
      );
    });
  });

  describe('markMyNotificationsRead', () => {
    it('should trigger bulk read updates', async () => {
      jest.mocked(service.markAllRead).mockResolvedValue({ updated: 5 });
      const result = await controller.markMyNotificationsRead(mockRequest);
      expect(result).toEqual({ updated: 5 });
    });
  });

  describe('getAll', () => {
    it('should parse and pass list filters', async () => {
      jest.mocked(service.findAll).mockResolvedValue([]);
      await controller.getAll('1', '10', 'security', 'critical', '456');
      expect(service.findAll).toHaveBeenCalledWith({
        page: '1',
        pageSize: '10',
        search: 'security',
        category: 'critical',
        eventId: '456',
        sortBy: undefined,
        sortOrder: undefined,
      });
    });
  });

  describe('getOrganizationEventNotifications', () => {
    it('should call findByOrganizationEvent with correct params', async () => {
      jest.mocked(service.findByOrganizationEvent).mockResolvedValue([]);
      await controller.getOrganizationEventNotifications(mockRequest, '789');
      expect(service.findByOrganizationEvent).toHaveBeenCalledWith(
        mockRequest.user,
        '789',
      );
    });
  });

  describe('createOrganizationEventNotification', () => {
    it('should build a new notification inside targeted event context', async () => {
      const dto: CreateOrganizationNotificationDto = {
        title: 'SOS',
        description: 'Fire',
      };
      jest
        .mocked(service.createForOrganizationEvent)
        .mockResolvedValue({ id: '1' });

      const result = await controller.createOrganizationEventNotification(
        mockRequest,
        '789',
        dto,
      );
      expect(result).toEqual({ id: '1' });
      expect(service.createForOrganizationEvent).toHaveBeenCalledWith(
        mockRequest.user,
        '789',
        dto,
      );
    });
  });
});
