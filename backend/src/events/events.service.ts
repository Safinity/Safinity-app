import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AddFavouriteBody = {
  activity_id?: string | number;
  activityId?: string | number;
};

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize<T>(value: T): T {
    const replacer = (_key: string, currentValue: unknown): unknown => {
      if (typeof currentValue === 'bigint') {
        return currentValue.toString();
      }

      return currentValue;
    };

    return JSON.parse(JSON.stringify(value, replacer)) as T;
  }

  private parseEventId(id: string) {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException(`Invalid event id: ${id}`);
    }
  }

  private parseActivityId(id: string) {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException(`Invalid activity id: ${id}`);
    }
  }

  private async nextBigIntId<T extends { id: bigint }>(
    finder: () => Promise<T | null>,
  ) {
    const lastRecord = await finder();
    return lastRecord ? lastRecord.id + 1n : 1n;
  }

  async getAllEvents() {
    const events = await this.prisma.event.findMany({
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

  async getEventById(id: string) {
    const eventId = this.parseEventId(id);
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
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
        event_activities: {
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
          orderBy: { start_time: 'asc' },
        },
        points_interest: {
          select: {
            id: true,
            event_id: true,
            coordinates: {
              select: {
                id: true,
                point_id: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return this.serialize(event);
  }

  async getPointsInterest(id: string) {
    const eventId = this.parseEventId(id);

    const pointsInterest = await this.prisma.points_interest.findMany({
      where: { event_id: eventId },
      select: {
        id: true,
        event_id: true,
        name: true,
        coordinates: {
          select: {
            id: true,
            point_id: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return this.serialize(pointsInterest);
  }

  async getMap(id: string) {
    const eventId = this.parseEventId(id);
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        venue_name: true,
        status: true,
        category: true,
        start_date: true,
        end_date: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const [pointsInterest, activities] = await Promise.all([
      this.prisma.points_interest.findMany({
        where: { event_id: eventId },
        select: {
          id: true,
          event_id: true,
          name: true,
          coordinates: {
            select: {
              id: true,
              point_id: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      }),
      this.prisma.event_activities.findMany({
        where: { event_id: eventId },
        select: {
          id: true,
          event_id: true,
          name: true,
          start_time: true,
          end_time: true,
          point_interest_id: true,
        },
        orderBy: { start_time: 'asc' },
      }),
    ]);

    return this.serialize({
      event,
      points_interest: pointsInterest,
      activities,
    });
  }

  async getActivities(id: string) {
    const eventId = this.parseEventId(id);

    const activities = await this.prisma.event_activities.findMany({
      where: { event_id: eventId },
      select: {
        id: true,
        event_id: true,
        name: true,
        start_time: true,
        end_time: true,
        description: true,
        point_interest_id: true,
        specifications: true,
        points_interest: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { start_time: 'asc' },
    });

    return this.serialize(activities);
  }

  async getPastEvents(userId: string) {
    if (!userId) {
      throw new BadRequestException('user_id is required');
    }

    const now = new Date();

    const tickets = await this.prisma.user_tickets.findMany({
      where: { user_id: userId },
      select: {
        event: {
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
        },
      },
    });

    const pastEvents = tickets
      .map((ticket) => ticket.event)
      .filter((event) => {
        if (!event) {
          return false;
        }

        if (event.end_date && event.end_date < now) {
          return true;
        }

        return (
          !event.end_date && event.start_date !== null && event.start_date < now
        );
      })
      .filter(
        (event, index, array) =>
          array.findIndex((candidate) => candidate.id === event.id) === index,
      )
      .sort((left, right) => {
        const leftTime = left.end_date ?? left.start_date ?? new Date(0);
        const rightTime = right.end_date ?? right.start_date ?? new Date(0);

        return rightTime.getTime() - leftTime.getTime();
      });

    return this.serialize(pastEvents);
  }

  async getFavourites(id: string, userId: string) {
    const eventId = this.parseEventId(id);

    if (!userId) {
      throw new BadRequestException('user_id is required');
    }

    const favourites = await this.prisma.user_favorites.findMany({
      where: {
        user_id: userId,
        event_activities: {
          event_id: eventId,
        },
      },
      select: {
        event_activities: {
          select: {
            id: true,
            event_id: true,
            name: true,
            start_time: true,
            end_time: true,
            description: true,
            image: true,
            speakers: true,
            speakers_img: true,
            point_interest_id: true,
            specifications: true,
            points_interest: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return this.serialize(
      favourites.map((favourite) => favourite.event_activities),
    );
  }

  async getActivityById(activityId: string) {
    const parsedActivityId = this.parseActivityId(activityId);
    const activity = await this.prisma.event_activities.findUnique({
      where: { id: parsedActivityId },
      select: {
        id: true,
        event_id: true,
        name: true,
        start_time: true,
        end_time: true,
        description: true,
        image: true,
        speakers: true,
        speakers_img: true,
        point_interest_id: true,
        specifications: true,
        points_interest: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${activityId} not found`);
    }

    return this.serialize(activity);
  }

  async addFavourite(userId: string, body: AddFavouriteBody) {
    const activityIdInput = body.activity_id ?? body.activityId;

    if (!userId || !activityIdInput) {
      throw new BadRequestException('activity_id is required');
    }

    const activityId = this.parseActivityId(String(activityIdInput));
    const activity = await this.prisma.event_activities.findUnique({
      where: { id: activityId },
      select: { id: true },
    });

    if (!activity) {
      throw new NotFoundException(
        `Activity with ID ${activityIdInput} not found`,
      );
    }

    const existingFavourite = await this.prisma.user_favorites.findFirst({
      where: {
        user_id: userId,
        activity_id: activityId,
      },
      select: {
        id: true,
        user_id: true,
        activity_id: true,
      },
    });

    if (existingFavourite) {
      return this.serialize(existingFavourite);
    }

    const nextId = await this.nextBigIntId(() =>
      this.prisma.user_favorites.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      }),
    );

    const favourite = await this.prisma.user_favorites.create({
      data: {
        id: nextId,
        user_id: String(userId),
        activity_id: activityId,
      },
      select: {
        id: true,
        user_id: true,
        activity_id: true,
      },
    });

    return this.serialize(favourite);
  }

  async findAll() {
    return this.getAllEvents();
  }

  async findOne(id: bigint) {
    return this.getEventById(id.toString());
  }
}
