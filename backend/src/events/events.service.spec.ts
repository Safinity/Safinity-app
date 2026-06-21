/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
            event: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            points_interest: {
              findMany: jest.fn(),
            },
            event_activities: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            user_tickets: {
              findMany: jest.fn(),
            },
            user_favorites: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get<PrismaService>(PrismaService);
    process.env.MAPBOX_TOKEN = 'mock-mapbox-token';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Validation & Parsing Guard Rails', () => {
    it('should throw BadRequestException if parsing an invalid eventId string containing non-integers', async () => {
      await expect(service.getEventById('invalid-id-abc')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if given numeric parameter fails validation bounds', async () => {
      await expect(service.getAllEvents({ page: '-5' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllEvents', () => {
    it('should query and serialize records accurately into pure JSON data maps', async () => {
      const mockRawPrismaEvent = [
        {
          id: 100n,
          name: 'Tech Convention',
          start_date: new Date('2026-06-20'),
          others: { custom: 'field' },
        },
      ];
      jest
        .mocked(prisma.event.findMany)
        .mockResolvedValue(mockRawPrismaEvent as any);

      const result = await service.getAllEvents({ search: 'Tech' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('100'); // Validando o BigInt serializer (.toString())
    });
  });

  describe('getEventById', () => {
    it('should throw NotFoundException if specific entity is absent', async () => {
      jest.mocked(prisma.event.findUnique).mockResolvedValue(null);

      await expect(service.getEventById('12345')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return fully structured relational model when entity exists', async () => {
      const mockEventPayload = {
        id: 12n,
        name: 'Aveiro Festival',
        event_activities: [],
        points_interest: [],
      };
      jest
        .mocked(prisma.event.findUnique)
        .mockResolvedValue(mockEventPayload as any);

      const result = await service.getEventById('12');

      expect(result.id).toBe('12');
      expect(result.name).toBe('Aveiro Festival');
    });
  });

  describe('getStaticMapImage', () => {
    it('should capture event geolocation bounds and retrieve remote binary buffer arrays', async () => {
      const mockQueryRawResponse = [
        {
          id: 45n,
          others: { map: { zoom: 14 } },
          center_lat: 40.6401,
          center_lng: -8.6536,
        },
      ];
      jest.mocked(prisma.$queryRaw).mockResolvedValue(mockQueryRawResponse);

      // Mock da resposta binária global do fetch (Mapbox API mock response)
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockFetchResponse = {
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
        headers: {
          get: jest.fn().mockReturnValue('image/png'),
        },
      };
      global.fetch = jest
        .fn()
        .mockResolvedValue(mockFetchResponse as any) as any;

      const result = await service.getStaticMapImage('45', {
        width: '800',
        height: '600',
      });

      expect(result.contentType).toBe('image/png');
      expect(result.buffer).toBeDefined();
    });

    it('should throw BadRequestException if external map api target returns error', async () => {
      jest.mocked(prisma.$queryRaw).mockResolvedValue([
        {
          id: 45n,
          others: {},
          center_lat: 40.6,
          center_lng: -8.6,
        },
      ]);

      global.fetch = jest
        .fn()
        .mockResolvedValue({ ok: false, status: 401 } as any) as any;

      await expect(service.getStaticMapImage('45')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getMap', () => {
    it('should throw NotFoundException if raw geospatial queries return no matrix lines', async () => {
      jest.mocked(prisma.$queryRaw).mockResolvedValue([]);

      await expect(service.getMap('99')).rejects.toThrow(NotFoundException);
    });

    it('should assemble a complete map coordinate profile using default geometry properties', async () => {
      // Mock para as 3 desestruturações do Promise.all() do getMap
      jest
        .mocked(prisma.$queryRaw)
        .mockResolvedValueOnce([
          { id: 10n, name: 'Main Ground', others: { map: { zoom: 15 } } },
        ]) // eventRows
        .mockResolvedValueOnce([
          { point_id: 1n, point_name: 'Stage Alpha', lat: 40.5, lng: -8.5 },
        ]); // pointsInterestRows

      jest.mocked(prisma.event_activities.findMany).mockResolvedValue([]);

      const result = await service.getMap('10');

      expect(result).toBeDefined();
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
    });
  });

  describe('activities and favourites', () => {
    it('lists event activities with pagination and serializes ids', async () => {
      jest
        .mocked(prisma.event_activities.findMany)
        .mockResolvedValue([{ id: 3n, event_id: 2n, name: 'Concert' }] as any);
      await expect(
        service.getActivities('2', {
          page: '2',
          pageSize: '5',
          search: 'music',
          sortBy: 'name',
          sortOrder: 'desc',
        }),
      ).resolves.toEqual([{ id: '3', event_id: '2', name: 'Concert' }]);
      expect(prisma.event_activities.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
          orderBy: { name: 'desc' },
        }),
      );
    });

    it('lists all activities', async () => {
      jest
        .mocked(prisma.event_activities.findMany)
        .mockResolvedValue([{ id: 1n }] as any);
      await expect(service.getAllActivities()).resolves.toEqual([{ id: '1' }]);
    });

    it('filters, deduplicates and sorts past ticketed events', async () => {
      const old = new Date('2020-01-01');
      jest.mocked(prisma.user_tickets.findMany).mockResolvedValue([
        { event: null },
        { event: { id: 1n, start_date: old, end_date: null } },
        { event: { id: 1n, start_date: old, end_date: null } },
        {
          event: {
            id: 2n,
            start_date: old,
            end_date: new Date('2021-01-01'),
          },
        },
      ] as any);
      await expect(service.getPastEvents('u1')).resolves.toEqual([
        expect.objectContaining({ id: '2' }),
        expect.objectContaining({ id: '1' }),
      ]);
      await expect(service.getPastEvents('')).rejects.toThrow(
        'user_id is required',
      );
    });

    it('returns the present ticketed event or null', async () => {
      const now = Date.now();
      jest.mocked(prisma.user_tickets.findMany).mockResolvedValue([
        { event: null },
        { event: { id: 1n, start_date: null, end_date: null } },
        {
          event: {
            id: 2n,
            start_date: new Date(now - 1000),
            end_date: null,
          },
        },
      ] as any);
      await expect(service.getPresentEvent('u1')).resolves.toMatchObject({
        id: '2',
      });
      jest.mocked(prisma.user_tickets.findMany).mockResolvedValue([]);
      await expect(service.getPresentEvent('u1')).resolves.toBeNull();
      await expect(service.getPresentEvent('')).rejects.toThrow(
        'user_id is required',
      );
    });

    it('gets favourites for one event', async () => {
      jest
        .mocked(prisma.user_favorites.findMany)
        .mockResolvedValue([
          { event_activities: { id: 7n, event_id: 2n } },
        ] as any);
      await expect(service.getFavourites('2', 'u1')).resolves.toEqual([
        { id: '7', event_id: '2' },
      ]);
      await expect(service.getFavourites('2', '')).rejects.toThrow(
        'user_id is required',
      );
    });

    it('gets one activity and validates missing activities', async () => {
      jest.mocked(prisma.event_activities.findUnique).mockResolvedValue({
        id: 7n,
        event_id: 2n,
      } as any);
      await expect(service.getActivityById('7')).resolves.toEqual({
        id: '7',
        event_id: '2',
      });
      jest.mocked(prisma.event_activities.findUnique).mockResolvedValue(null);
      await expect(service.getActivityById('8')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getActivityById('bad')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('returns an existing favourite without creating another', async () => {
      jest
        .mocked(prisma.event_activities.findUnique)
        .mockResolvedValue({ id: 7n } as any);
      jest.mocked(prisma.user_favorites.findFirst).mockResolvedValue({
        id: 4n,
        user_id: 'u1',
        activity_id: 7n,
      });
      await expect(
        service.addFavourite('u1', { activityId: 7 }),
      ).resolves.toEqual({
        id: '4',
        user_id: 'u1',
        activity_id: '7',
      });
    });

    it('creates and removes a favourite', async () => {
      jest
        .mocked(prisma.event_activities.findUnique)
        .mockResolvedValue({ id: 7n } as any);
      jest
        .mocked(prisma.user_favorites.findFirst)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 9n } as any);
      jest.mocked(prisma.user_favorites.create).mockResolvedValue({
        id: 10n,
        user_id: 'u1',
        activity_id: 7n,
      });
      await expect(
        service.addFavourite('u1', { activity_id: 7 }),
      ).resolves.toMatchObject({
        id: '10',
      });

      jest.mocked(prisma.user_favorites.findFirst).mockResolvedValue({
        id: 10n,
        user_id: 'u1',
        activity_id: 7n,
      });
      jest.mocked(prisma.user_favorites.delete).mockResolvedValue({
        id: 10n,
        user_id: 'u1',
        activity_id: 7n,
      });
      await expect(service.removeFavourite('u1', '7')).resolves.toMatchObject({
        id: '10',
      });
    });

    it('validates favourite inputs and missing records', async () => {
      await expect(service.addFavourite('', {})).rejects.toThrow(
        'activity_id is required',
      );
      jest.mocked(prisma.event_activities.findUnique).mockResolvedValue(null);
      await expect(
        service.addFavourite('u1', { activity_id: 9 }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.addFavouriteFromBody({ activity_id: 9 }),
      ).rejects.toThrow('user_id is required');
      await expect(service.removeFavourite('', '9')).rejects.toThrow(
        'user_id is required',
      );
      jest.mocked(prisma.user_favorites.findFirst).mockResolvedValue(null);
      await expect(service.removeFavourite('u1', '9')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('supports compatibility aliases', async () => {
      jest.spyOn(service, 'getAllEvents').mockResolvedValue([]);
      jest.spyOn(service, 'getEventById').mockResolvedValue({ id: '3' } as any);
      await expect(service.findAll()).resolves.toEqual([]);
      await expect(service.findOne(3n)).resolves.toEqual({ id: '3' });
    });
  });
});
