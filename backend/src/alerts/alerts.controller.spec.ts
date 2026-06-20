import { Test, TestingModule } from '@nestjs/testing';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

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

  // TEST 1: POST /alerts - Create alert
  describe('POST /alerts', () => {
    it('should create alert', async () => {
      const input = {
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
        event_id: 1n,
      };

      (service.create as jest.Mock).mockResolvedValue(mockAlert);

      const result = await controller.create(input as any);

      expect(result.title).toBe('Fire Alert');
      expect(service.create as jest.Mock).toHaveBeenCalledWith(input);
    });

    it('should handle create error', async () => {
      const input = {
        title: 'Alert',
        event_id: null,
      };

      (service.create as jest.Mock).mockRejectedValue(
        new Error('Invalid event'),
      );

      await expect(controller.create(input as any)).rejects.toThrow(
        'Invalid event',
      );
    });
  });

  // TEST 2: POST /alerts/organization/alerts/:alertId/assign-self
  describe('POST /alerts/organization/alerts/:alertId/assign-self', () => {
    it('should assign alert to self', async () => {
      const user = { id: 'user1', role: 'staff' };
      const alertId = '1';

      const mockAlert = {
        id: 1n,
        staff_id: 1n,
        title: 'Alert',
      };

      (service.assignAlertToSelf as jest.Mock).mockResolvedValue(mockAlert);

      const result = await controller.assignAlertToSelf(
        { user } as any,
        alertId,
      );

      expect(result.staff_id).toBe(1n);
      expect(service.assignAlertToSelf as jest.Mock).toHaveBeenCalledWith(
        user,
        alertId,
      );
    });

    it('should throw if alert not found', async () => {
      const user = { id: 'user1' };

      (service.assignAlertToSelf as jest.Mock).mockRejectedValue(
        new Error('Alert not found'),
      );

      await expect(
        controller.assignAlertToSelf({ user } as any, '999'),
      ).rejects.toThrow('Alert not found');
    });
  });

  // TEST 3: GET /alerts/organization/events/:eventId
  describe('GET /alerts/organization/events/:eventId', () => {
    it('should get organization event alerts', async () => {
      const user = { id: 'user1', role: 'staff' };
      const eventId = '1';

      const mockAlerts = [
        { id: 1n, title: 'Alert 1' },
        { id: 2n, title: 'Alert 2' },
      ];

      (service.findByOrganizationEvent as jest.Mock).mockResolvedValue(
        mockAlerts,
      );

      const result = await controller.getOrganizationEventAlerts(
        { user } as any,
        eventId,
      );

      expect(result).toHaveLength(2);
      expect(service.findByOrganizationEvent as jest.Mock).toHaveBeenCalledWith(
        user,
        eventId,
      );
    });

    it('should return empty list if no alerts', async () => {
      const user = { id: 'user1' };

      (service.findByOrganizationEvent as jest.Mock).mockResolvedValue([]);

      const result = await controller.getOrganizationEventAlerts(
        { user } as any,
        '1',
      );

      expect(result).toEqual([]);
    });
  });

  // TEST 4: PATCH /alerts/organization/alerts/:alertId/status
  describe('PATCH /alerts/organization/alerts/:alertId/status', () => {
    it('should update alert status', async () => {
      const user = { id: 'user1', role: 'staff' };
      const alertId = '1';
      const body = { status: 'resolved' };

      const mockAlert = {
        id: 1n,
        status: 'resolved',
      };

      (service.updateAssignedAlertStatus as jest.Mock).mockResolvedValue(
        mockAlert,
      );

      const result = await controller.updateAssignedAlertStatus(
        { user } as any,
        alertId,
        body,
      );

      expect(result.status).toBe('resolved');
      expect(
        service.updateAssignedAlertStatus as jest.Mock,
      ).toHaveBeenCalledWith(user, alertId, 'resolved');
    });

    it('should throw if status is invalid', async () => {
      const user = { id: 'user1' };
      const body = { status: '' };

      (service.updateAssignedAlertStatus as jest.Mock).mockRejectedValue(
        new Error('Status is required'),
      );

      await expect(
        controller.updateAssignedAlertStatus({ user } as any, '1', body),
      ).rejects.toThrow('Status is required');
    });

    it('should throw if not assigned to staff', async () => {
      const user = { id: 'user1' };
      const body = { status: 'resolved' };

      (service.updateAssignedAlertStatus as jest.Mock).mockRejectedValue(
        new Error('Alert not assigned to you'),
      );

      await expect(
        controller.updateAssignedAlertStatus({ user } as any, '1', body),
      ).rejects.toThrow('Alert not assigned to you');
    });
  });

  // TEST 5: Validações gerais
  describe('General validations', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('service should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have all endpoints', () => {
      expect(typeof controller.create).toBe('function');
      expect(typeof controller.assignAlertToSelf).toBe('function');
      expect(typeof controller.getOrganizationEventAlerts).toBe('function');
      expect(typeof controller.updateAssignedAlertStatus).toBe('function');
    });
  });
});
