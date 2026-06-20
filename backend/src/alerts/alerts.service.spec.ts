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
      (prisma.event.findUnique as jest.Mock).mockResolvedValue({
        id: 1n,
      });
      (prisma.alerts.create as jest.Mock).mockResolvedValue({
        id: 1n,
        title: 'Fire Alert',
      });

      const input = {
        title: 'Fire Alert',
        description: 'Fire detected',
        category: 'safety',
        status: 'active',
        event_id: '1',
        sos_id: null,
        staff_id: undefined,
      } as unknown as CreateAlertDto;

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
      const user = {
        id: 'user1',
      } as unknown as AuthenticatedUser;

      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        staff_details: {
          id: 1n,
          organization_id: 'org1',
        },
      });

      (prisma.alerts.findUnique as jest.Mock).mockResolvedValue({
        id: 1n,
        event_id: 1n,
        staff_id: null,
        event: {
          organization_id: 'org1',
        },
      });

      (prisma.alerts.update as jest.Mock).mockResolvedValue({
        id: 1n,
        staff_id: 1n,
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
      const user = {
        id: 'user1',
      } as unknown as AuthenticatedUser;

      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        staff_details: {
          id: 1n,
          organization_id: 'org1',
        },
      });

      (prisma.alerts.findUnique as jest.Mock).mockResolvedValue({
        id: 1n,
        staff_id: 1n,
        event: {
          organization_id: 'org1',
        },
      });

      (prisma.alerts.update as jest.Mock).mockResolvedValue({
        id: 1n,
        status: 'resolved',
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
      const user = {
        id: 'user1',
      } as unknown as AuthenticatedUser;

      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        staff_details: {
          organization_id: 'org1',
        },
      });

      (prisma.event.findUnique as jest.Mock).mockResolvedValue({
        id: 1n,
        organization_id: 'org1',
      });

      (prisma.alerts.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1n,
          title: 'Alert 1',
        },
      ]);

      const result = await service.findByOrganizationEvent(user, '1');

      expect(result).toHaveLength(1);
    });
  });
});
