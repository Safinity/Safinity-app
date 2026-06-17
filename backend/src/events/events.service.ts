import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type AddFavouriteBody = {
  user_id?: string;
  userId?: string;
  activity_id?: string | number;
  activityId?: string | number;
};

type EventsListQuery = {
  page?: string;
  pageSize?: string;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: 'start_date' | 'end_date' | 'name';
  sortOrder?: 'asc' | 'desc';
};

type ActivitiesListQuery = {
  page?: string;
  pageSize?: string;
  search?: string;
  sortBy?: 'start_time' | 'end_time' | 'name';
  sortOrder?: 'asc' | 'desc';
};

type GeoPoint = {
  lat: number;
  lng: number;
};

type MapBounds = {
  north: number;
  south: number;
  west: number;
  east: number;
};

type MapPinDefinition = {
  id?: string | number;
  name?: string;
  type?: string;
  point_interest_id?: string | number;
  lat?: number;
  lng?: number;
  friendId?: string;
};

type MapStageDefinition = {
  id?: string | number;
  name?: string;
  point_interest_id?: string | number;
  rotation?: number;
  width?: number;
  height?: number;
  lat?: number;
  lng?: number;
};

type EventMapConfig = {
  zoom?: number;
  bounds?: MapBounds;
  currentLocation?: GeoPoint;
  pins?: MapPinDefinition[];
  stages?: MapStageDefinition[];
};

type StaticMapOptions = {
  width?: string;
  height?: string;
  theme?: 'light' | 'dark';
};

type MapFriendLocationRow = {
  friend_id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  lat: number | null;
  lng: number | null;
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

  private parseGeoPoint(lat: unknown, lng: unknown): GeoPoint | null {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return null;
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return { lat, lng };
  }

  private getMapConfig(others: unknown): EventMapConfig {
    if (!others || typeof others !== 'object') {
      return {};
    }

    const map = (others as { map?: unknown }).map;

    if (!map || typeof map !== 'object') {
      return {};
    }

    return map;
  }

  private inferPointType(name?: string | null) {
    const normalized = name?.toLowerCase() ?? '';

    if (normalized.includes('palco') || normalized.includes('stage')) {
      return 'stage';
    }

    if (normalized.includes('food') || normalized.includes('bar')) {
      return 'food';
    }

    if (normalized.includes('wc') || normalized.includes('restroom')) {
      return 'wc';
    }

    if (normalized.includes('entrada') || normalized.includes('entrance')) {
      return 'entrance';
    }

    if (
      normalized.includes('saída') ||
      normalized.includes('saida') ||
      normalized.includes('exit')
    ) {
      return 'exit';
    }

    if (
      normalized.includes('médico') ||
      normalized.includes('medico') ||
      normalized.includes('medical')
    ) {
      return 'medical';
    }

    return 'point';
  }

  private buildFallbackBounds(center: GeoPoint): MapBounds {
    const latitudeDelta = 0.0045;
    const longitudeDelta = 0.0045;

    return {
      north: center.lat + latitudeDelta,
      south: center.lat - latitudeDelta,
      west: center.lng - longitudeDelta,
      east: center.lng + longitudeDelta,
    };
  }

  private getMapboxToken() {
    return process.env.MAPBOX_TOKEN ?? process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  }

  private getMapboxStaticUrl({
    center,
    zoom = 16,
    width = 1024,
    height = 1024,
    theme = 'dark',
  }: {
    center: GeoPoint;
    zoom?: number;
    width?: number;
    height?: number;
    theme?: 'light' | 'dark';
  }) {
    const token = this.getMapboxToken();

    if (!token) {
      throw new BadRequestException('Mapbox token is not configured');
    }

    const style = theme === 'dark' ? 'mapbox/dark-v11' : 'mapbox/streets-v12';
    const normalizedWidth = Math.min(Math.max(width, 1), 1280);
    const normalizedHeight = Math.min(Math.max(height, 1), 1280);

    return (
      `https://api.mapbox.com/styles/v1/${style}/static/` +
      `${center.lng},${center.lat},${zoom}/${normalizedWidth}x${normalizedHeight}` +
      `?access_token=${token}`
    );
  }

  private async getEventMapCenterAndConfig(id: string) {
    const eventId = this.parseEventId(id);
    const [event] = await this.prisma.$queryRaw<
      Array<{
        id: bigint;
        others: unknown;
        center_lat: number | null;
        center_lng: number | null;
      }>
    >(Prisma.sql`
      SELECT
        id,
        others,
        CASE
          WHEN location IS NULL THEN NULL
          ELSE ST_Y(location::geometry)
        END AS center_lat,
        CASE
          WHEN location IS NULL THEN NULL
          ELSE ST_X(location::geometry)
        END AS center_lng
      FROM event
      WHERE id = ${eventId}
      LIMIT 1
    `);

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const mapConfig = this.getMapConfig(event.others);
    const center = this.parseGeoPoint(event.center_lat, event.center_lng) ??
      mapConfig.currentLocation ?? { lat: 0, lng: 0 };

    return { center, mapConfig };
  }

  async getStaticMapImage(id: string, options?: StaticMapOptions) {
    const { center, mapConfig } = await this.getEventMapCenterAndConfig(id);
    const width = this.parsePositiveInt(options?.width, 1024);
    const height = this.parsePositiveInt(options?.height, 1024);
    const theme = options?.theme === 'light' ? 'light' : 'dark';
    const mapUrl = this.getMapboxStaticUrl({
      center,
      zoom: mapConfig.zoom ?? 16,
      width,
      height,
      theme,
    });

    const response = await fetch(mapUrl);

    if (!response.ok) {
      throw new BadRequestException(
        `Mapbox request failed: ${response.status}`,
      );
    }

    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      contentType: response.headers.get('content-type') ?? 'image/png',
      cacheControl: 'public, max-age=300',
    };
  }

  private async getLatestLocationForUser(
    userId: string,
  ): Promise<GeoPoint | null> {
    const [row] = await this.prisma.$queryRaw<
      Array<{ lat: number | null; lng: number | null }>
    >(Prisma.sql`
      SELECT
        COALESCE(
          ST_Y(latest_location.location::geometry),
          ST_Y(u.location::geometry)
        ) AS lat,
        COALESCE(
          ST_X(latest_location.location::geometry),
          ST_X(u.location::geometry)
        ) AS lng
      FROM users u
      LEFT JOIN LATERAL (
        SELECT location
        FROM user_locations
        WHERE user_id = u.id
        ORDER BY timestamp DESC
        LIMIT 1
      ) latest_location ON true
      WHERE u.id = ${userId}::uuid
      LIMIT 1
    `);

    return this.parseGeoPoint(row?.lat, row?.lng);
  }

  private async getFriendsAtEventWithLocations(
    userId: string,
    eventId: bigint,
  ): Promise<MapFriendLocationRow[]> {
    return await this.prisma.$queryRaw<MapFriendLocationRow[]>(Prisma.sql`
      SELECT
        u.id AS friend_id,
        u.name,
        u.username,
        encode(u.image, 'base64') AS image,
        COALESCE(
          ST_Y(latest_location.location::geometry),
          ST_Y(u.location::geometry)
        ) AS lat,
        COALESCE(
          ST_X(latest_location.location::geometry),
          ST_X(u.location::geometry)
        ) AS lng
      FROM friendship f
      JOIN users u
        ON u.id = CASE
          WHEN f.user1_id = ${userId}::uuid THEN f.user2_id
          ELSE f.user1_id
        END
      JOIN user_tickets ut
        ON ut.user_id = u.id
       AND ut.event_id = ${eventId}
      LEFT JOIN LATERAL (
        SELECT location
        FROM user_locations
        WHERE user_id = u.id
        ORDER BY timestamp DESC
        LIMIT 1
      ) latest_location ON true
      WHERE f.state IN ('ACCEPTED', 'accepted')
        AND (f.user1_id = ${userId}::uuid OR f.user2_id = ${userId}::uuid)
      ORDER BY u.name ASC NULLS LAST, u.username ASC NULLS LAST
    `);
  }

  async getAllEvents(query?: EventsListQuery) {
    const page = this.parsePositiveInt(query?.page, 1);
    const pageSize = Math.min(this.parsePositiveInt(query?.pageSize, 20), 100);
    const skip = (page - 1) * pageSize;
    const sortBy = query?.sortBy ?? 'start_date';
    const sortOrder: Prisma.SortOrder = query?.sortOrder ?? 'asc';

    const where: Prisma.eventWhereInput = {
      ...(query?.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              {
                description: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              { venue_name: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query?.category ? { category: query.category } : {}),
      ...(query?.status ? { status: query.status } : {}),
    };

    const events = await this.prisma.event.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: pageSize,
      select: {
        id: true,
        organization_id: true,
        name: true,
        venue_name: true,
        description: true,
        status: true,
        category: true,
        image: true,
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
        image: true,
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

  async getMap(id: string, userId?: string) {
    const eventId = this.parseEventId(id);
    const [eventRows, pointsInterestRows, activities] = await Promise.all([
      this.prisma.$queryRaw<
        Array<{
          id: bigint;
          name: string | null;
          venue_name: string | null;
          status: string | null;
          category: string | null;
          start_date: Date | null;
          end_date: Date | null;
          others: unknown;
          center_lat: number | null;
          center_lng: number | null;
        }>
      >(Prisma.sql`
        SELECT
          id,
          name,
          venue_name,
          status,
          category,
          start_date,
          end_date,
          others,
          CASE
            WHEN location IS NULL THEN NULL
            ELSE ST_Y(location::geometry)
          END AS center_lat,
          CASE
            WHEN location IS NULL THEN NULL
            ELSE ST_X(location::geometry)
          END AS center_lng
        FROM event
        WHERE id = ${eventId}
        LIMIT 1
      `),
      this.prisma.$queryRaw<
        Array<{
          point_id: bigint;
          point_name: string | null;
          coordinate_id: bigint | null;
          lat: number | null;
          lng: number | null;
        }>
      >(Prisma.sql`
        SELECT DISTINCT ON (pi.id)
          pi.id AS point_id,
          pi.name AS point_name,
          c.id AS coordinate_id,
          CASE
            WHEN c.location IS NULL THEN NULL
            ELSE ST_Y(c.location::geometry)
          END AS lat,
          CASE
            WHEN c.location IS NULL THEN NULL
            ELSE ST_X(c.location::geometry)
          END AS lng
        FROM points_interest pi
        LEFT JOIN coordinates c ON c.point_id = pi.id
        WHERE pi.event_id = ${eventId}
        ORDER BY pi.id ASC, c.id ASC
      `),
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

    const event = eventRows[0];

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const mapConfig = this.getMapConfig(event.others);
    const parsedCenter = this.parseGeoPoint(event.center_lat, event.center_lng);
    let center = parsedCenter;

    if (!center) {
      center = mapConfig.currentLocation ?? { lat: 0, lng: 0 };
    }
    const bounds = mapConfig.bounds ?? this.buildFallbackBounds(center);
    const pointsById = new Map(
      pointsInterestRows.map((point) => [String(point.point_id), point]),
    );

    const friendLocations = userId
      ? await this.getFriendsAtEventWithLocations(userId, eventId)
      : [];
    const currentUserLocation = userId
      ? await this.getLatestLocationForUser(userId)
      : null;

    const staticPins = (mapConfig.pins ?? [])
      .filter((definition) => definition.type !== 'friend')
      .map((definition) => {
        const pointId = definition.point_interest_id;
        const point =
          pointId !== undefined && pointId !== null
            ? pointsById.get(String(pointId))
            : undefined;
        const resolvedPoint = this.parseGeoPoint(
          point?.lat ?? definition.lat,
          point?.lng ?? definition.lng,
        );

        if (!resolvedPoint) {
          return null;
        }

        const resolvedId =
          definition.id ??
          definition.point_interest_id ??
          definition.name ??
          `${resolvedPoint.lat}-${resolvedPoint.lng}`;

        return {
          id: String(resolvedId),
          name: definition.name ?? point?.point_name ?? 'Point of interest',
          type: definition.type ?? 'point',
          lat: resolvedPoint.lat,
          lng: resolvedPoint.lng,
          point_interest_id:
            pointId !== undefined && pointId !== null ? String(pointId) : null,
          friendId: definition.friendId ?? null,
        };
      })
      .filter((pin): pin is NonNullable<typeof pin> => pin !== null);
    const staticPointIds = new Set(
      staticPins
        .map((pin) => pin.point_interest_id)
        .filter((pointId): pointId is string => Boolean(pointId)),
    );
    const pointInterestPins = pointsInterestRows
      .map((point) => {
        if (staticPointIds.has(String(point.point_id))) {
          return null;
        }

        const resolvedPoint = this.parseGeoPoint(point.lat, point.lng);
        const inferredType = this.inferPointType(point.point_name);

        if (!resolvedPoint || inferredType === 'stage') {
          return null;
        }

        return {
          id: `poi-${String(point.point_id)}`,
          name: point.point_name ?? 'Point of interest',
          type: inferredType,
          lat: resolvedPoint.lat,
          lng: resolvedPoint.lng,
          point_interest_id: String(point.point_id),
          friendId: null,
        };
      })
      .filter((pin): pin is NonNullable<typeof pin> => pin !== null);

    const friendPins = friendLocations
      .map((friend) => {
        const resolvedPoint = this.parseGeoPoint(friend.lat, friend.lng);

        if (!resolvedPoint) {
          return null;
        }

        return {
          id: friend.friend_id,
          friendId: friend.friend_id,
          name: friend.name ?? friend.username ?? 'Friend',
          type: 'friend',
          lat: resolvedPoint.lat,
          lng: resolvedPoint.lng,
          image: friend.image,
        };
      })
      .filter((pin): pin is NonNullable<typeof pin> => pin !== null);

    const stages = (mapConfig.stages ?? [])
      .map((definition) => {
        const pointId = definition.point_interest_id;
        const point =
          pointId !== undefined && pointId !== null
            ? pointsById.get(String(pointId))
            : undefined;
        const resolvedPoint = this.parseGeoPoint(
          point?.lat ?? definition.lat,
          point?.lng ?? definition.lng,
        );

        if (!resolvedPoint) {
          return null;
        }

        const resolvedId =
          definition.id ??
          definition.point_interest_id ??
          definition.name ??
          `${resolvedPoint.lat}-${resolvedPoint.lng}`;

        return {
          id: String(resolvedId),
          name: definition.name ?? point?.point_name ?? 'Stage',
          lat: resolvedPoint.lat,
          lng: resolvedPoint.lng,
          rotation: definition.rotation ?? 0,
          width: definition.width ?? 90,
          height: definition.height ?? 60,
        };
      })
      .filter((stage): stage is NonNullable<typeof stage> => stage !== null);
    const stagePointIds = new Set(
      stages.map((stage) => String(stage.id).replace(/^poi-/, '')),
    );
    const pointInterestStages = pointsInterestRows
      .map((point) => {
        if (
          stagePointIds.has(String(point.point_id)) ||
          this.inferPointType(point.point_name) !== 'stage'
        ) {
          return null;
        }

        const resolvedPoint = this.parseGeoPoint(point.lat, point.lng);

        if (!resolvedPoint) {
          return null;
        }

        return {
          id: `poi-${String(point.point_id)}`,
          name: point.point_name ?? 'Stage',
          lat: resolvedPoint.lat,
          lng: resolvedPoint.lng,
          rotation: 0,
          width: 100,
          height: 62,
        };
      })
      .filter((stage): stage is NonNullable<typeof stage> => stage !== null);

    let resolvedCurrentLocation = currentUserLocation;

    if (!resolvedCurrentLocation) {
      resolvedCurrentLocation = mapConfig.currentLocation ?? center;
    }

    return this.serialize({
      event: {
        ...event,
        location: center,
      },
      map: {
        center,
        zoom: mapConfig.zoom ?? 16,
        bounds,
        currentLocation: resolvedCurrentLocation,
        pins: [...staticPins, ...pointInterestPins, ...friendPins],
        stages: [...stages, ...pointInterestStages],
      },
      points_interest: pointsInterestRows,
      activities,
    });
  }

  async getActivities(id: string, query?: ActivitiesListQuery) {
    const eventId = this.parseEventId(id);
    const page = this.parsePositiveInt(query?.page, 1);
    const pageSize = Math.min(this.parsePositiveInt(query?.pageSize, 20), 100);
    const skip = (page - 1) * pageSize;
    const sortBy = query?.sortBy ?? 'start_time';
    const sortOrder: Prisma.SortOrder = query?.sortOrder ?? 'asc';

    const activities = await this.prisma.event_activities.findMany({
      where: {
        event_id: eventId,
        ...(query?.search
          ? {
              OR: [
                { name: { contains: query.search, mode: 'insensitive' } },
                {
                  description: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),
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
        points_interest: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: pageSize,
    });

    return this.serialize(activities);
  }

  async getAllActivities() {
    const activities = await this.prisma.event_activities.findMany({
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
      orderBy: [{ event_id: 'asc' }, { start_time: 'asc' }],
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
            image: true,
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

  async getPresentEvent(userId: string) {
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
            image: true,
            start_date: true,
            end_date: true,
            others: true,
          },
        },
      },
    });

    const presentEvent = tickets
      .map((ticket) => ticket.event)
      .filter((event) => {
        if (!event) {
          return false;
        }

        if (!event.start_date) {
          return false;
        }

        const startTime = event.start_date;
        const endTime =
          event.end_date ?? new Date(startTime.getTime() + 24 * 60 * 60 * 1000);

        return now >= startTime && now <= endTime;
      })
      .filter(
        (event, index, array) =>
          array.findIndex((candidate) => candidate.id === event.id) === index,
      )[0];

    return presentEvent ? this.serialize(presentEvent) : null;
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

  async addFavouriteFromBody(body: AddFavouriteBody) {
    const userId = body.user_id ?? body.userId;

    if (!userId) {
      throw new BadRequestException('user_id is required');
    }

    return this.addFavourite(String(userId), body);
  }

  async findAll() {
    return this.getAllEvents({});
  }

  async findOne(id: bigint) {
    return this.getEventById(id.toString());
  }

  async removeFavourite(userId: string, activityIdParam: string) {
    if (!userId) {
      throw new BadRequestException('user_id is required');
    }

    const activityId = this.parseActivityId(activityIdParam);

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

    if (!existingFavourite) {
      throw new NotFoundException(
        `Favourite for activity ID ${activityIdParam} not found`,
      );
    }

    const deletedFavourite = await this.prisma.user_favorites.delete({
      where: {
        id: existingFavourite.id,
      },
      select: {
        id: true,
        user_id: true,
        activity_id: true,
      },
    });

    return this.serialize(deletedFavourite);
  }
}
