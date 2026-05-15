import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

type CreateAdminEventBody = {
  name?: string;
  venue_name?: string;
  description?: string;
  status?: string;
  category?: string;
  start_date?: string | Date;
  end_date?: string | Date;
  others?: unknown;
};

type UpdateAdminEventBody = Partial<CreateAdminEventBody>;

type CreateAdminEventActivityBody = {
  name?: string;
  start_time?: string | Date;
  end_time?: string | Date;
  description?: string;
  point_interest_id?: string | number;
  specifications?: unknown;
};

type CreateAdminPointInterestBody = {
  name?: string;
};

type AdminScope = {
  userId: string;
  organizationId: bigint;
};

@Injectable()
export class AdminEventsService {
  constructor(private readonly prisma: PrismaService) {}

  private toNullableJsonInput(
    value: unknown,
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
    if (value === null || value === undefined) {
      return Prisma.JsonNull;
    }

    return value as Prisma.InputJsonValue;
  }

  private serialize<T>(value: T): T {
    const replacer = (_key: string, currentValue: unknown): unknown => {
      if (typeof currentValue === 'bigint') {
        return currentValue.toString();
      }

      return currentValue;
    };

    return JSON.parse(JSON.stringify(value, replacer)) as T;
  }

  private parseBigInt(value: string, fieldName: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(`Invalid ${fieldName}: ${value}`);
    }
  }

  private parseDate(value: string | Date | undefined, fieldName: string) {
    if (!value) {
      return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }

    return parsed;
  }

  private ensureOrgAdminRole(roleInOrg?: string | null) {
    const normalized = roleInOrg?.trim().toLowerCase();

    if (normalized !== 'admin' && normalized !== 'owner') {
      throw new ForbiddenException(
        'Only organization admins can perform this action',
      );
    }
  }

  private async resolveAdminScope(
    user?: AuthenticatedUser,
  ): Promise<AdminScope> {
    if (!user?.id) {
      throw new UnauthorizedException('Authentication required');
    }

    const dbUser = await this.prisma.users.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        staff_details: {
          select: {
            organization_id: true,
            role_in_org: true,
          },
        },
      },
    });

    if (!dbUser) {
      throw new UnauthorizedException('Authenticated user not found');
    }

    const organizationId = dbUser.staff_details?.organization_id;

    if (!organizationId) {
      throw new ForbiddenException(
        'User is not associated with any organization',
      );
    }

    this.ensureOrgAdminRole(dbUser.staff_details?.role_in_org);

    return {
      userId: dbUser.id,
      organizationId,
    };
  }

  private async nextBigIntId<T extends { id: bigint }>(
    finder: () => Promise<T | null>,
  ) {
    const lastRecord = await finder();
    return lastRecord ? lastRecord.id + 1n : 1n;
  }

  private async assertEventBelongsToOrganization(
    eventId: bigint,
    organizationId: bigint,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, organization_id: true },
    });

    if (!event) {
      throw new NotFoundException(
        `Event with ID ${eventId.toString()} not found`,
      );
    }

    if (event.organization_id !== organizationId) {
      throw new ForbiddenException(
        'You can only manage events from your organization',
      );
    }
  }

  async getOrganizationEvents(user?: AuthenticatedUser) {
    const scope = await this.resolveAdminScope(user);

    const events = await this.prisma.event.findMany({
      where: { organization_id: scope.organizationId },
      orderBy: { start_date: 'asc' },
      select: {
        id: true,
        organization_id: true,
        name: true,
        venue_name: true,
        description: true,
        status: true,
        category: true,
        start_date: true,
        end_date: true,
        others: true,
      },
    });

    return this.serialize(events);
  }

  async createEvent(
    user: AuthenticatedUser | undefined,
    body: CreateAdminEventBody,
  ) {
    const scope = await this.resolveAdminScope(user);
    const name = body.name?.trim();

    if (!name) {
      throw new BadRequestException('name is required');
    }

    const startDate = this.parseDate(body.start_date, 'start_date');
    const endDate = this.parseDate(body.end_date, 'end_date');

    if (startDate && endDate && endDate < startDate) {
      throw new BadRequestException('end_date must be after start_date');
    }

    const id = await this.nextBigIntId(() =>
      this.prisma.event.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      }),
    );

    const event = await this.prisma.event.create({
      data: {
        id,
        organization_id: scope.organizationId,
        name,
        venue_name: body.venue_name?.trim() || null,
        description: body.description?.trim() || null,
        status: body.status?.trim() || null,
        category: body.category?.trim() || null,
        start_date: startDate,
        end_date: endDate,
        others: this.toNullableJsonInput(body.others),
      },
      select: {
        id: true,
        organization_id: true,
        name: true,
        venue_name: true,
        description: true,
        status: true,
        category: true,
        start_date: true,
        end_date: true,
        others: true,
      },
    });

    return this.serialize(event);
  }

  async updateEvent(
    user: AuthenticatedUser | undefined,
    eventIdInput: string,
    body: UpdateAdminEventBody,
  ) {
    const scope = await this.resolveAdminScope(user);
    const eventId = this.parseBigInt(eventIdInput, 'event id');

    await this.assertEventBelongsToOrganization(eventId, scope.organizationId);

    const updateData = {
      name: body.name?.trim(),
      venue_name: body.venue_name?.trim(),
      description: body.description?.trim(),
      status: body.status?.trim(),
      category: body.category?.trim(),
      start_date:
        body.start_date === undefined
          ? undefined
          : this.parseDate(body.start_date, 'start_date'),
      end_date:
        body.end_date === undefined
          ? undefined
          : this.parseDate(body.end_date, 'end_date'),
      others:
        body.others === undefined
          ? undefined
          : this.toNullableJsonInput(body.others),
    };

    if (
      updateData.start_date &&
      updateData.end_date &&
      updateData.end_date < updateData.start_date
    ) {
      throw new BadRequestException('end_date must be after start_date');
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id: eventId },
      data: updateData,
      select: {
        id: true,
        organization_id: true,
        name: true,
        venue_name: true,
        description: true,
        status: true,
        category: true,
        start_date: true,
        end_date: true,
        others: true,
      },
    });

    return this.serialize(updatedEvent);
  }

  async createPointInterest(
    user: AuthenticatedUser | undefined,
    eventIdInput: string,
    body: CreateAdminPointInterestBody,
  ) {
    const scope = await this.resolveAdminScope(user);
    const eventId = this.parseBigInt(eventIdInput, 'event id');

    await this.assertEventBelongsToOrganization(eventId, scope.organizationId);

    const id = await this.nextBigIntId(() =>
      this.prisma.points_interest.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      }),
    );

    const point = await this.prisma.points_interest.create({
      data: {
        id,
        event_id: eventId,
        name: body.name?.trim() || null,
      },
      select: {
        id: true,
        event_id: true,
        name: true,
      },
    });

    return this.serialize(point);
  }

  async createEventActivity(
    user: AuthenticatedUser | undefined,
    eventIdInput: string,
    body: CreateAdminEventActivityBody,
  ) {
    const scope = await this.resolveAdminScope(user);
    const eventId = this.parseBigInt(eventIdInput, 'event id');

    await this.assertEventBelongsToOrganization(eventId, scope.organizationId);

    const pointInterestId = body.point_interest_id;

    if (!pointInterestId) {
      throw new BadRequestException('point_interest_id is required');
    }

    const parsedPointInterestId = this.parseBigInt(
      String(pointInterestId),
      'point_interest_id',
    );
    const pointInterest = await this.prisma.points_interest.findUnique({
      where: { id: parsedPointInterestId },
      select: {
        id: true,
        event_id: true,
      },
    });

    if (!pointInterest) {
      throw new NotFoundException(
        `Point of interest with ID ${String(pointInterestId)} not found`,
      );
    }

    if (pointInterest.event_id !== eventId) {
      throw new BadRequestException(
        'point_interest_id must belong to the selected event',
      );
    }

    const startTime = this.parseDate(body.start_time, 'start_time');
    const endTime = this.parseDate(body.end_time, 'end_time');

    if (!body.name?.trim() || !startTime || !endTime) {
      throw new BadRequestException(
        'name, start_time and end_time are required',
      );
    }

    if (endTime < startTime) {
      throw new BadRequestException('end_time must be after start_time');
    }

    const id = await this.nextBigIntId(() =>
      this.prisma.event_activities.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      }),
    );

    const activity = await this.prisma.event_activities.create({
      data: {
        id,
        event_id: eventId,
        name: body.name.trim(),
        start_time: startTime,
        end_time: endTime,
        description: body.description?.trim() || null,
        point_interest_id: parsedPointInterestId,
        specifications: this.toNullableJsonInput(body.specifications),
      },
      select: {
        id: true,
        event_id: true,
        name: true,
        start_time: true,
        end_time: true,
        description: true,
        point_interest_id: true,
        specifications: true,
      },
    });

    return this.serialize(activity);
  }
}
