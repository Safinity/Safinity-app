/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsRealtimeService } from './notifications-realtime.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: {
            notifications: {
              findMany: jest.fn(),
              create: jest.fn(),
              aggregate: jest.fn(),
            },
            user_tickets: {
              findMany: jest.fn(),
            },
            event: {
              findUnique: jest.fn(),
            },
            users: {
              findUnique: jest.fn(),
            },
            user_notification_status: {
              aggregate: jest.fn(),
              upsert: jest.fn(),
            },
            $transaction: jest.fn((promises) => Promise.all(promises)),
          },
        },
        {
          provide: NotificationsRealtimeService,
          useValue: {
            emitNotificationCreated: jest.fn(),
            emitReadAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should fail if query parameters contain an invalid page integer', async () => {
      await expect(service.findAll({ page: '-5' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should filter properly by category and event BigInt conversions', async () => {
      jest.mocked(prisma.notifications.findMany).mockResolvedValue([]);
      await service.findAll({ category: 'crowd', eventId: '123' });
      expect(prisma.notifications.findMany).toHaveBeenCalled();
    });
  });

  describe('findForTicketedEvents', () => {
    it('should throw UnauthorizedException if user token context is missing', async () => {
      await expect(service.findForTicketedEvents(undefined)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return empty list immediately if user contains no linked tickets', async () => {
      jest
        .mocked(prisma.users.findUnique)
        .mockResolvedValue({ id: 'user-uuid' } as any);
      jest.mocked(prisma.user_tickets.findMany).mockResolvedValue([]);

      const result = await service.findForTicketedEvents({
        id: 'user-uuid',
        roles: [],
      });
      expect(result).toEqual([]);
    });

    it('should map notification category payloads correctly into text classifications', async () => {
      jest
        .mocked(prisma.users.findUnique)
        .mockResolvedValue({ id: 'user-uuid' } as any);
      jest
        .mocked(prisma.user_tickets.findMany)
        .mockResolvedValue([{ event_id: 10n }] as any);
      jest.mocked(prisma.notifications.findMany).mockResolvedValue([
        {
          id: 1n,
          event_id: 10n,
          title: 'Hydrate!',
          description: 'Drink water',
          category: 'hydration_alert',
          time: new Date(),
          user_notification_status: [],
        },
      ] as any);

      const result: any = await service.findForTicketedEvents({
        id: 'user-uuid',
        roles: [],
      });
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('hydrate');
    });
  });

  describe('findByOrganizationEvent', () => {
    it('should throw NotFoundException if requested event reference cannot be found', async () => {
      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        staff_details: { organization_id: BigInt(1) },
      } as any);
      jest.mocked(prisma.event.findUnique).mockResolvedValue(null);

      await expect(
        service.findByOrganizationEvent(
          { id: 'staff-id', roles: ['staff'] },
          '999',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if event belongs to another ecosystem organization', async () => {
      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        staff_details: { organization_id: BigInt(1) },
      } as any);
      jest.mocked(prisma.event.findUnique).mockResolvedValue({
        id: 999n,
        organization_id: BigInt(2),
      } as any);

      await expect(
        service.findByOrganizationEvent(
          { id: 'staff-id', roles: ['staff'] },
          '999',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markAllRead', () => {
    it('should exit gracefully returning updated zero count if all elements are read', async () => {
      jest
        .mocked(prisma.users.findUnique)
        .mockResolvedValue({ id: 'user-uuid' } as any);
      jest
        .mocked(prisma.user_tickets.findMany)
        .mockResolvedValue([{ event_id: 10n }] as any);
      jest.mocked(prisma.notifications.findMany).mockResolvedValue([
        {
          id: 1n,
          event_id: 10n,
          title: 'T',
          description: 'D',
          category: 'cat',
          time: new Date(),
          user_notification_status: [{ read_at: new Date() }],
        },
      ] as any);

      const result = await service.markAllRead({ id: 'user-uuid', roles: [] });
      expect(result).toEqual({ updated: 0 });
    });
  });
});
