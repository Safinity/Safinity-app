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
      jest
        .mocked(prisma.$queryRaw)
        .mockResolvedValue(mockQueryRawResponse as any);

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
      ] as any);

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
      jest.mocked(prisma.$queryRaw).mockResolvedValue([] as any);

      await expect(service.getMap('99')).rejects.toThrow(NotFoundException);
    });

    it('should assemble a complete map coordinate profile using default geometry properties', async () => {
      // Mock para as 3 desestruturações do Promise.all() do getMap
      jest
        .mocked(prisma.$queryRaw)
        .mockResolvedValueOnce([
          { id: 10n, name: 'Main Ground', others: { map: { zoom: 15 } } },
        ] as any) // eventRows
        .mockResolvedValueOnce([
          { point_id: 1n, point_name: 'Stage Alpha', lat: 40.5, lng: -8.5 },
        ] as any); // pointsInterestRows

      jest
        .mocked(prisma.event_activities.findMany)
        .mockResolvedValue([] as any);

      const result = await service.getMap('10');

      expect(result).toBeDefined();
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
    });
  });
});
