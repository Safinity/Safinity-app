import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

type NotificationsListQuery = {
  page?: string;
  pageSize?: string;
  search?: string;
  category?: string;
  eventId?: string;
  sortBy?: 'time' | 'title';
  sortOrder?: 'asc' | 'desc';
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private parsePositiveInt(
    value: string | undefined,
    fallback: number,
  ): number {
    if (!value) {
      return fallback;
    }

    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new BadRequestException(`Invalid numeric value: ${value}`);
    }

    return parsed;
  }

  async findAll(query?: NotificationsListQuery) {
    const page = this.parsePositiveInt(query?.page, 1);
    const pageSize = Math.min(this.parsePositiveInt(query?.pageSize, 20), 100);
    const skip = (page - 1) * pageSize;
    const sortBy = query?.sortBy ?? 'time';
    const sortOrder: Prisma.SortOrder = query?.sortOrder ?? 'desc';

    const where: Prisma.notificationsWhereInput = {
      ...(query?.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              {
                description: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
      ...(query?.category ? { category: query.category } : {}),
      ...(query?.eventId
        ? {
            event_id: this.toBigInt(query.eventId, 'eventId'),
          }
        : {}),
    };

    return await this.prisma.notifications.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: pageSize,
      include: { event: true },
    });
  }

  async create(input: CreateNotificationDto) {
    this.validateInput(input);
    const id = await this.nextId();
    const eventId =
      input.event_id === null || input.event_id === undefined
        ? null
        : this.toBigInt(input.event_id, 'event_id');

    return await this.prisma.notifications.create({
      data: {
        id,
        event_id: eventId,
        title: input.title,
        description: input.description,
        category: input.category,
      },
      include: { event: true },
    });
  }

  private async nextId(): Promise<bigint> {
    const result = await this.prisma.notifications.aggregate({
      _max: { id: true },
    });

    return (result._max.id ?? BigInt(0)) + BigInt(1);
  }

  private validateInput(input: CreateNotificationDto) {
    const errors: string[] = [];

    if (input.event_id !== null && input.event_id !== undefined) {
      const validEventId =
        typeof input.event_id === 'number'
          ? Number.isInteger(input.event_id)
          : typeof input.event_id === 'string' &&
            /^[0-9]+$/.test(input.event_id);

      if (!validEventId) {
        errors.push('event_id must be a valid integer');
      }
    }

    this.validateOptionalString(input.title, 32, 'title', errors);
    this.validateOptionalString(input.description, 255, 'description', errors);
    this.validateOptionalString(input.category, 32, 'category', errors);

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('; '));
    }
  }

  private validateOptionalString(
    value: unknown,
    maxLength: number,
    fieldName: string,
    errors: string[],
  ) {
    if (value === undefined || value === null) {
      return;
    }

    if (typeof value !== 'string') {
      errors.push(`${fieldName} must be a string`);
      return;
    }

    if (value.length > maxLength) {
      errors.push(`${fieldName} must not exceed ${maxLength} characters`);
    }
  }

  private toBigInt(value: string | number | bigint, fieldName: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(
        `Invalid ${fieldName}. Must be a valid integer`,
      );
    }
  }
}
