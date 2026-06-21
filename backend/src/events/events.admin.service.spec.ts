/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminEventsService } from './events.admin.service';

describe('AdminEventsService', () => {
  const prisma = {
    users: { findUnique: jest.fn() },
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    points_interest: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    event_activities: { findFirst: jest.fn(), create: jest.fn() },
  };
  const admin = { id: 'admin-id' } as any;
  let service: AdminEventsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminEventsService(prisma as never);
    prisma.users.findUnique.mockResolvedValue({
      id: 'admin-id',
      staff_details: { organization_id: 5n, role_in_org: ' Admin ' },
    });
    prisma.event.findUnique.mockResolvedValue({
      id: 10n,
      organization_id: 5n,
    });
  });

  it('lists organization events and serializes ids', async () => {
    prisma.event.findMany.mockResolvedValue([{ id: 10n, organization_id: 5n }]);
    await expect(service.getOrganizationEvents(admin)).resolves.toEqual([
      { id: '10', organization_id: '5' },
    ]);
  });

  it('validates the authenticated organization admin scope', async () => {
    await expect(service.getOrganizationEvents()).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    prisma.users.findUnique.mockResolvedValueOnce(null);
    await expect(service.getOrganizationEvents(admin)).rejects.toThrow(
      'Authenticated user not found',
    );
    prisma.users.findUnique.mockResolvedValueOnce({
      id: 'admin-id',
      staff_details: null,
    });
    await expect(service.getOrganizationEvents(admin)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    prisma.users.findUnique.mockResolvedValueOnce({
      id: 'admin-id',
      staff_details: { organization_id: 5n, role_in_org: 'member' },
    });
    await expect(service.getOrganizationEvents(admin)).rejects.toThrow(
      'Only organization admins',
    );
  });

  it('creates an event with normalized values and the next id', async () => {
    prisma.event.findFirst.mockResolvedValue({ id: 9n });
    prisma.event.create.mockImplementation(({ data }: any) =>
      Promise.resolve(data),
    );
    const result = await service.createEvent(admin, {
      name: ' Festival ',
      venue_name: ' Venue ',
      start_date: '2026-07-01',
      end_date: new Date('2026-07-02'),
      others: { capacity: 100 },
    });
    expect(result).toMatchObject({
      id: '10',
      organization_id: '5',
      name: 'Festival',
      venue_name: 'Venue',
    });
  });

  it('creates the first event and stores nullable fields', async () => {
    prisma.event.findFirst.mockResolvedValue(null);
    prisma.event.create.mockImplementation(({ data }: any) =>
      Promise.resolve(data),
    );
    await service.createEvent(admin, { name: 'First' });
    expect(prisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 1n,
          start_date: null,
          end_date: null,
        }),
      }),
    );
  });

  it('rejects invalid event input', async () => {
    await expect(service.createEvent(admin, {})).rejects.toThrow(
      'name is required',
    );
    await expect(
      service.createEvent(admin, { name: 'x', start_date: 'invalid' }),
    ).rejects.toThrow('Invalid start_date');
    await expect(
      service.createEvent(admin, {
        name: 'x',
        start_date: '2026-07-03',
        end_date: '2026-07-02',
      }),
    ).rejects.toThrow('end_date must be after start_date');
  });

  it('updates an event belonging to the organization', async () => {
    prisma.event.update.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: 10n, ...data }),
    );
    await expect(
      service.updateEvent(admin, '10', {
        name: ' Updated ',
        start_date: '2026-08-01',
        end_date: '2026-08-02',
        others: null,
      }),
    ).resolves.toMatchObject({ id: '10', name: 'Updated' });
  });

  it('rejects invalid, missing and foreign events', async () => {
    await expect(service.updateEvent(admin, 'nope', {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
    prisma.event.findUnique.mockResolvedValueOnce(null);
    await expect(service.updateEvent(admin, '10', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
    prisma.event.findUnique.mockResolvedValueOnce({
      id: 10n,
      organization_id: 99n,
    });
    await expect(service.updateEvent(admin, '10', {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(
      service.updateEvent(admin, '10', {
        start_date: '2026-09-03',
        end_date: '2026-09-02',
      }),
    ).rejects.toThrow('end_date must be after start_date');
  });

  it('creates a point of interest', async () => {
    prisma.points_interest.findFirst.mockResolvedValue({ id: 3n });
    prisma.points_interest.create.mockImplementation(({ data }: any) =>
      Promise.resolve(data),
    );
    await expect(
      service.createPointInterest(admin, '10', { name: ' Gate ' }),
    ).resolves.toEqual({ id: '4', event_id: '10', name: 'Gate' });
  });

  it('creates an event activity', async () => {
    prisma.points_interest.findUnique.mockResolvedValue({
      id: 2n,
      event_id: 10n,
    });
    prisma.event_activities.findFirst.mockResolvedValue(null);
    prisma.event_activities.create.mockImplementation(({ data }: any) =>
      Promise.resolve(data),
    );
    await expect(
      service.createEventActivity(admin, '10', {
        name: ' Concert ',
        point_interest_id: 2,
        start_time: '2026-07-01T20:00:00Z',
        end_time: '2026-07-01T22:00:00Z',
        specifications: { age: 18 },
      }),
    ).resolves.toMatchObject({ id: '1', event_id: '10', name: 'Concert' });
  });

  it('validates activity point and dates', async () => {
    await expect(service.createEventActivity(admin, '10', {})).rejects.toThrow(
      'point_interest_id is required',
    );
    prisma.points_interest.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.createEventActivity(admin, '10', { point_interest_id: 2 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    prisma.points_interest.findUnique.mockResolvedValueOnce({
      id: 2n,
      event_id: 11n,
    });
    await expect(
      service.createEventActivity(admin, '10', { point_interest_id: 2 }),
    ).rejects.toThrow('must belong to the selected event');
    prisma.points_interest.findUnique.mockResolvedValue({
      id: 2n,
      event_id: 10n,
    });
    await expect(
      service.createEventActivity(admin, '10', { point_interest_id: 2 }),
    ).rejects.toThrow('name, start_time and end_time are required');
    await expect(
      service.createEventActivity(admin, '10', {
        point_interest_id: 2,
        name: 'x',
        start_time: '2026-07-02',
        end_time: '2026-07-01',
      }),
    ).rejects.toThrow('end_time must be after start_time');
  });
});
