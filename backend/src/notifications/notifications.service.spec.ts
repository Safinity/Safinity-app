/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

    it('applies search, pagination and sorting', async () => {
      jest.mocked(prisma.notifications.findMany).mockResolvedValue([]);
      await service.findAll({
        page: '2',
        pageSize: '5',
        search: 'safety',
        sortBy: 'title',
        sortOrder: 'asc',
      });
      expect(prisma.notifications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
          orderBy: { title: 'asc' },
        }),
      );
    });
  });

  describe('create', () => {
    it('creates and broadcasts a notification with the next id', async () => {
      jest.mocked(prisma.notifications.aggregate).mockResolvedValue({
        _max: { id: 4n },
      } as any);
      jest.mocked(prisma.notifications.create).mockResolvedValue({
        id: 5n,
        event_id: 10n,
        title: 'Alert',
      } as any);
      await expect(
        service.create({
          event_id: '10',
          title: 'Alert',
          description: null,
          category: 'security',
        }),
      ).resolves.toMatchObject({ id: 5n });
    });

    it('supports notifications without events and validates content', async () => {
      jest
        .mocked(prisma.notifications.aggregate)
        .mockResolvedValue({ _max: { id: null } } as any);
      jest
        .mocked(prisma.notifications.create)
        .mockResolvedValue({ id: 1n, event_id: null } as any);
      await service.create({
        event_id: null,
        title: null,
        description: null,
        category: null,
      });
      await expect(
        service.create({
          event_id: 'invalid',
          title: 123 as any,
          description: 'x'.repeat(256),
          category: null,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
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

    it('returns organization event notifications', async () => {
      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        staff_details: { organization_id: 1n },
      } as any);
      jest
        .mocked(prisma.event.findUnique)
        .mockResolvedValue({ id: 10n, organization_id: 1n } as any);
      jest
        .mocked(prisma.notifications.findMany)
        .mockResolvedValue([{ id: 2n }] as any);
      await expect(
        service.findByOrganizationEvent({ id: 'staff', roles: [] }, '10'),
      ).resolves.toEqual([{ id: 2n }]);
    });
  });

  describe('createForOrganizationEvent', () => {
    it('creates trimmed organization notifications', async () => {
      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        staff_details: { organization_id: 1n },
      } as any);
      jest
        .mocked(prisma.event.findUnique)
        .mockResolvedValue({ id: 10n, organization_id: 1n } as any);
      jest
        .mocked(prisma.notifications.aggregate)
        .mockResolvedValue({ _max: { id: 2n } } as any);
      jest
        .mocked(prisma.notifications.create)
        .mockResolvedValue({ id: 3n, event_id: 10n } as any);
      await expect(
        service.createForOrganizationEvent({ id: 'staff', roles: [] }, '10', {
          title: ' Alert ',
          description: ' Description ',
          category: ' crowd ',
        }),
      ).resolves.toMatchObject({ id: 3n });
      expect(prisma.notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'Alert' }),
        }),
      );
    });

    it('rejects missing, foreign and invalid organization notifications', async () => {
      jest.mocked(prisma.users.findUnique).mockResolvedValue({
        staff_details: { organization_id: 1n },
      } as any);
      jest.mocked(prisma.event.findUnique).mockResolvedValueOnce(null);
      await expect(
        service.createForOrganizationEvent(
          { id: 'staff', roles: [] },
          '10',
          {},
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
      jest
        .mocked(prisma.event.findUnique)
        .mockResolvedValueOnce({ id: 10n, organization_id: 2n } as any);
      await expect(
        service.createForOrganizationEvent(
          { id: 'staff', roles: [] },
          '10',
          {},
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      jest
        .mocked(prisma.event.findUnique)
        .mockResolvedValue({ id: 10n, organization_id: 1n } as any);
      await expect(
        service.createForOrganizationEvent({ id: 'staff', roles: [] }, '10', {
          title: 'x'.repeat(33),
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
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

    it('upserts unread statuses and returns the updated count', async () => {
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
          category: 'friend_sos',
          time: new Date(),
          user_notification_status: [],
        },
      ] as any);
      jest.mocked(prisma.user_notification_status.aggregate).mockResolvedValue({
        _max: { id: 7n },
      } as any);
      jest
        .mocked(prisma.user_notification_status.upsert)
        .mockResolvedValue({} as any);
      await expect(
        service.markAllRead({ id: 'user-uuid', roles: [] }),
      ).resolves.toEqual({ updated: 1 });
      expect(prisma.user_notification_status.upsert).toHaveBeenCalled();
    });
  });

  it('maps all notification category families', () => {
    const map = (value: string | null) =>
      (service as any).mapCategoryToType(value);
    expect([
      map('activity'),
      map('crowd'),
      map('hydration'),
      map('security'),
      map('sos'),
      map('emergency'),
      map('friend'),
      map(null),
    ]).toEqual([
      'activity',
      'crowd',
      'hydrate',
      'security',
      'sos',
      'emergency',
      'friend',
      'event',
    ]);
  });

  it('validates staff and app user resolution', async () => {
    await expect(
      service.findByOrganizationEvent(undefined, '1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    jest.mocked(prisma.users.findUnique).mockResolvedValue(null);
    await expect(
      service.findByOrganizationEvent({ id: 'staff', roles: [] }, '1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.findForTicketedEvents({ id: 'missing', roles: [] }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
