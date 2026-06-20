/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CreateAlertDto } from './dto/create-alert.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

describe('AlertsController', () => {
  let controller: AlertsController;
  let service: AlertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
      providers: [
        {
          provide: AlertsService,
          useValue: {
            create: jest.fn(),
            assignAlertToSelf: jest.fn(),
            updateAssignedAlertStatus: jest.fn(),
            findByOrganizationEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AlertsController>(AlertsController);
    service = module.get<AlertsService>(AlertsService);
  });

  describe('POST /alerts', () => {
    it('should create alert', async () => {
      const input: CreateAlertDto = {
        title: 'Fire Alert',
        description: 'Fire detected',
        category: 'safety',
        status: 'active',
        event_id: '1',
        sos_id: null,
        staff_id: undefined,
      };

      const mockAlert = {
        id: 1n,
        title: 'Fire Alert',
        description: 'Fire detected',
        category: 'safety',
        status: 'active',
        event_id: 1n,
        sos_id: null,
        staff_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.mocked(service.create).mockResolvedValue(mockAlert);

      const result = await controller.create(input);

      expect(result.title).toBe('Fire Alert');
      expect(jest.mocked(service.create)).toHaveBeenCalledWith(input);
    });

    it('should handle create error', async () => {
      const input = {
        title: 'Alert',
        event_id: null,
      } as unknown as CreateAlertDto;

      jest.mocked(service.create).mockRejectedValue(new Error('Invalid event'));

      await expect(controller.create(input)).rejects.toThrow('Invalid event');
    });
  });

  describe('POST /alerts/organization/alerts/:alertId/assign-self', () => {
    it('should assign alert to self', async () => {
      const user: AuthenticatedUser = {
        id: 'user1',
        clerk_id: 'c1',
        email: 'e1',
        role: 'staff',
      };
      const alertId = '1';

      const mockAlert = {
        id: 1n,
        title: 'Alert',
        description: '',
        category: 'safety',
        status: 'active',
        event_id: 1n,
        sos_id: null,
        staff_id: 1n,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.mocked(service.assignAlertToSelf).mockResolvedValue(mockAlert);

      const result = await controller.assignAlertToSelf(
        { user } as unknown as Request & { user: AuthenticatedUser },
        alertId,
      );

      expect(result.staff_id).toBe(1n);
      expect(jest.mocked(service.assignAlertToSelf)).toHaveBeenCalledWith(
        user,
        alertId,
      );
    });

    it('should throw if alert not found', async () => {
      const user = { id: 'user1' } as AuthenticatedUser;

      jest
        .mocked(service.assignAlertToSelf)
        .mockRejectedValue(new Error('Alert not found'));

      await expect(
        controller.assignAlertToSelf(
          { user } as unknown as Request & { user: AuthenticatedUser },
          '999',
        ),
      ).rejects.toThrow('Alert not found');
    });
  });

  describe('GET /alerts/organization/events/:eventId', () => {
    it('should get organization event alerts', async () => {
      const user = { id: 'user1', role: 'staff' } as AuthenticatedUser;
      const eventId = '1';

      const mockAlerts = [
        {
          id: 1n,
          title: 'Alert 1',
          description: '',
          category: 'safety',
          status: 'active',
          event_id: 1n,
          sos_id: null,
          staff_id: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest
        .mocked(service.findByOrganizationEvent)
        .mockResolvedValue(mockAlerts);

      const result = await controller.getOrganizationEventAlerts(
        { user } as unknown as Request & { user: AuthenticatedUser },
        eventId,
      );

      expect(result).toHaveLength(1);
      expect(jest.mocked(service.findByOrganizationEvent)).toHaveBeenCalledWith(
        user,
        eventId,
      );
    });
  });

  describe('PATCH /alerts/organization/alerts/:alertId/status', () => {
    it('should update alert status', async () => {
      const user = { id: 'user1', role: 'staff' } as AuthenticatedUser;
      const alertId = '1';
      const body = { status: 'resolved' };

      const mockAlert = {
        id: 1n,
        title: 'Alert',
        description: '',
        category: 'safety',
        status: 'resolved',
        event_id: 1n,
        sos_id: null,
        staff_id: 1n,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .mocked(service.updateAssignedAlertStatus)
        .mockResolvedValue(mockAlert);

      const result = await controller.updateAssignedAlertStatus(
        { user } as unknown as Request & { user: AuthenticatedUser },
        alertId,
        body,
      );

      expect(result.status).toBe('resolved');
      expect(
        jest.mocked(service.updateAssignedAlertStatus),
      ).toHaveBeenCalledWith(user, alertId, 'resolved');
    });
  });

  describe('General validations', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('service should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});
