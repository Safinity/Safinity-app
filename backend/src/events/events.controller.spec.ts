/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { RequestWithUser } from '../auth/auth.types';
import type { Response } from 'express';
import { StreamableFile } from '@nestjs/common';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockRequest = {
    user: { id: 'user-uuid-123' },
  } as unknown as RequestWithUser;

  const mockResponse = {
    set: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: {
            getAllEvents: jest.fn(),
            getPastEvents: jest.fn(),
            getPresentEvent: jest.fn(),
            getEventById: jest.fn(),
            getPointsInterest: jest.fn(),
            getMap: jest.fn(),
            getStaticMapImage: jest.fn(),
            getActivities: jest.fn(),
            getFavourites: jest.fn(),
            getActivityById: jest.fn(),
            addFavourite: jest.fn(),
            removeFavourite: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllEvents', () => {
    it('should forward all query parameters down to the service', async () => {
      jest.mocked(service.getAllEvents).mockResolvedValue([] as any);

      await controller.getAllEvents(
        '1',
        '10',
        'festival',
        'music',
        'active',
        'name',
        'desc',
      );

      expect(service.getAllEvents).toHaveBeenCalledWith({
        page: '1',
        pageSize: '10',
        search: 'festival',
        category: 'music',
        status: 'active',
        sortBy: 'name',
        sortOrder: 'desc',
      });
    });
  });

  describe('getPastEvents', () => {
    it('should return past events for the authenticated user', async () => {
      jest.mocked(service.getPastEvents).mockResolvedValue([] as any);

      await controller.getPastEvents(mockRequest);

      expect(service.getPastEvents).toHaveBeenCalledWith('user-uuid-123');
    });
  });

  describe('getPresentEvent', () => {
    it('should return the current active event for user', async () => {
      jest
        .mocked(service.getPresentEvent)
        .mockResolvedValue({ id: '1' } as any);

      const result = await controller.getPresentEvent(mockRequest);

      expect(result).toEqual({ id: '1' });
      expect(service.getPresentEvent).toHaveBeenCalledWith('user-uuid-123');
    });
  });

  describe('getEventById', () => {
    it('should return event details matching parametric id', async () => {
      jest.mocked(service.getEventById).mockResolvedValue({ id: '45' } as any);

      const result = await controller.getEventById('45');

      expect(result).toEqual({ id: '45' });
      expect(service.getEventById).toHaveBeenCalledWith('45');
    });
  });

  describe('getPointsInterest', () => {
    it('should retrieve POIs for given event', async () => {
      jest.mocked(service.getPointsInterest).mockResolvedValue([] as any);

      await controller.getPointsInterest('99');

      expect(service.getPointsInterest).toHaveBeenCalledWith('99');
    });
  });

  describe('getMap', () => {
    it('should aggregate map configurations for verified user contextual map', async () => {
      jest.mocked(service.getMap).mockResolvedValue({ zoom: 16 } as any);

      await controller.getMap('12', mockRequest);

      expect(service.getMap).toHaveBeenCalledWith('12', 'user-uuid-123');
    });
  });

  describe('getStaticMap', () => {
    it('should build streaming file and configure express target response headers', async () => {
      const mockImageMeta = {
        buffer: Buffer.from('image-binary'),
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=300',
      };
      jest
        .mocked(service.getStaticMapImage)
        .mockResolvedValue(mockImageMeta as any);

      const result = await controller.getStaticMap(
        '12',
        '600',
        '400',
        'dark',
        mockResponse,
      );

      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=300',
      });
      expect(result).toBeInstanceOf(StreamableFile);
    });
  });

  describe('getActivities', () => {
    it('should call getActivities with structured layout options', async () => {
      jest.mocked(service.getActivities).mockResolvedValue([] as any);

      await controller.getActivities(
        '12',
        '2',
        '25',
        'concert',
        'start_time',
        'asc',
      );

      expect(service.getActivities).toHaveBeenCalledWith('12', {
        page: '2',
        pageSize: '25',
        search: 'concert',
        sortBy: 'start_time',
        sortOrder: 'asc',
      });
    });
  });

  describe('Favourites Operations', () => {
    it('should pull lists of user specific event benchmarks', async () => {
      jest.mocked(service.getFavourites).mockResolvedValue([] as any);

      await controller.getFavourites('12', mockRequest);

      expect(service.getFavourites).toHaveBeenCalledWith('12', 'user-uuid-123');
    });

    it('should bookmark target item via addFavourite matching body signature', async () => {
      const dto = { activityId: '777' };
      jest.mocked(service.addFavourite).mockResolvedValue({ id: '1' } as any);

      await controller.addFavourite(dto, mockRequest);

      expect(service.addFavourite).toHaveBeenCalledWith('user-uuid-123', dto);
    });

    it('should remove activity from favorites stack', async () => {
      jest
        .mocked(service.removeFavourite)
        .mockResolvedValue({ success: true } as any);

      await controller.removeFavourite('777', mockRequest);

      expect(service.removeFavourite).toHaveBeenCalledWith(
        'user-uuid-123',
        '777',
      );
    });
  });

  describe('getActivityById', () => {
    it('should extract unique activity payload', async () => {
      jest
        .mocked(service.getActivityById)
        .mockResolvedValue({ id: '777' } as any);

      await controller.getActivityById('777');

      expect(service.getActivityById).toHaveBeenCalledWith('777');
    });
  });
});
