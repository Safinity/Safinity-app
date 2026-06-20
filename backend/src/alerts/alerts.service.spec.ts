import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CreateAlertDto } from './dto/create-alert.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

describe('AlertsService', () => {
  let service: AlertsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: PrismaService,
          useValue: {
            alerts: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              aggregate: jest.fn().mockReturnValue({
                _max: { id: 0n },
              }),
            },
            event: {
              findUnique: jest.fn(),
            },
            users: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create alert with valid event', async () => {
      jest.mocked(prisma.event.findUnique).mockResolvedValue({
        id: 1n,
        organization_id: 'org1',
        name: 'Event',
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      });

      jest.mocked(prisma.alerts.create).mockResolvedValue({
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
      });

      const input: CreateAlertDto = {
        title: 'Fire Alert',
        description: 'Fire detected',
        category: 'safety',
        status: 'active',
        event_id: '1',
        sos_id: null,
        staff_id: undefined,
      };

      const result = await service.create(input);

      expect(result.title).toBe('Fire Alert');
    });

    it('should throw if event_id missing', async () => {
      const input = {
        title: 'Alert',
        category: 'safety',
        status: 'active',
        event_id: null,
        sos_id: null,
        staff_id: undefined,
      } as unknown as CreateAlertDto;

      await expect(service.create(input)).rejects.toThrow(BadRequestException);
    });
  });

  describe('assignAlertToSelf', () => {
    it('should assign alert', async () => {
      const user: AuthenticatedUser = {
        id: 'user1',
        clerk_id: 'clerk1',
        email: 'staff@example.com',
        role: 'staff',
      };

      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        id: 'user1',
        clerk_id: 'clerk1',
        name: 'Staff',
        email: 'staff@example.com',
        username: 'staff1',
        image: null,
        role: 'staff',
        emergency_contact: null,
        created_at: new Date(),
        updated_at: new Date(),
        staff_details: {
          id: 1n,
          user_id: 'user1',
          organization_id: 'org1',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      jest.mocked(prisma.alerts.findUnique).mockResolvedValue({
        id: 1n,
        title: 'Alert',
        description: '',
        category: 'safety',
        status: 'active',
        event_id: 1n,
        sos_id: null,
        staff_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        event: {
          organization_id: 'org1',
        },
      });

      jest.mocked(prisma.alerts.update).mockResolvedValue({
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
      });

      const result = await service.assignAlertToSelf(user, '1');

      expect(result.staff_id).toBe(1n);
    });

    it('should throw if not authenticated', async () => {
      await expect(
        service.assignAlertToSelf(
          undefined as unknown as AuthenticatedUser,
          '1',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateAssignedAlertStatus', () => {
    it('should update status', async () => {
      const user: AuthenticatedUser = {
        id: 'user1',
        clerk_id: 'clerk1',
        email: 'staff@example.com',
        role: 'staff',
      };

      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        id: 'user1',
        clerk_id: 'clerk1',
        name: 'Staff',
        email: 'staff@example.com',
        username: 'staff1',
        image: null,
        role: 'staff',
        emergency_contact: null,
        created_at: new Date(),
        updated_at: new Date(),
        staff_details: {
          id: 1n,
          user_id: 'user1',
          organization_id: 'org1',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      jest.mocked(prisma.alerts.findUnique).mockResolvedValue({
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
        event: {
          organization_id: 'org1',
        },
      });

      jest.mocked(prisma.alerts.update).mockResolvedValue({
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
      });

      const result = await service.updateAssignedAlertStatus(
        user,
        '1',
        'resolved',
      );

      expect(result.status).toBe('resolved');
    });
  });

  describe('findByOrganizationEvent', () => {
    it('should return alerts', async () => {
      const user: AuthenticatedUser = {
        id: 'user1',
        clerk_id: 'clerk1',
        email: 'staff@example.com',
        role: 'staff',
      };

      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        id: 'user1',
        clerk_id: 'clerk1',
        name: 'Staff',
        email: 'staff@example.com',
        username: 'staff1',
        image: null,
        role: 'staff',
        emergency_contact: null,
        created_at: new Date(),
        updated_at: new Date(),
        staff_details: {
          id: 1n,
          user_id: 'user1',
          organization_id: 'org1',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      jest.mocked(prisma.event.findUnique).mockResolvedValue({
        id: 1n,
        organization_id: 'org1',
        name: 'Event',
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      });

      jest.mocked(prisma.alerts.findMany).mockResolvedValue([
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
      ]);

      const result = await service.findByOrganizationEvent(user, '1');

      expect(result).toHaveLength(1);
    });
  });
});
