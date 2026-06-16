import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type SensorUpdateBody = {
  sensor_id?: string | number;
  sensorId?: string | number;
  event_id?: string | number;
  eventId?: string | number;
  value?: number;
  density?: number;
  sensor_type?: string;
  sensorType?: string;
};

@Injectable()
export class SensorsService implements OnModuleInit, OnModuleDestroy {
  private updateTimer: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.updateTimer = setInterval(() => {
      this.simulateCrowdDensityReadings().catch((error) => {
        console.error('[SENSORS] Failed to simulate sensor readings:', error);
      });
    }, 10_000);
  }

  onModuleDestroy() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  }

  private serialize<T>(value: T): T {
    return JSON.parse(
      JSON.stringify(value, (_key, currentValue) =>
        typeof currentValue === 'bigint'
          ? currentValue.toString()
          : currentValue,
      ),
    ) as T;
  }

  private parseBigInt(value: string | number | undefined, label: string) {
    if (value === undefined || value === null || value === '') {
      throw new BadRequestException(`${label} is required`);
    }

    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(`Invalid ${label}: ${value}`);
    }
  }

  private parseDensity(value: unknown) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      throw new BadRequestException('density value is required');
    }

    return Math.max(0, Math.min(100, parsed));
  }

  private assertWebhookSecret(secret?: string) {
    const expectedSecret = process.env.SENSOR_WEBHOOK_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
      throw new UnauthorizedException('Invalid sensor webhook secret');
    }
  }

  async findByEvent(eventIdInput: string) {
    const eventId = this.parseBigInt(eventIdInput, 'event_id');
    const sensors = await this.prisma.$queryRaw<
      Array<{
        id: bigint;
        event_id: bigint | null;
        sensor_type: string | null;
        density: number | null;
        last_reading_time: Date | null;
        lat: number | null;
        lng: number | null;
      }>
    >(Prisma.sql`
      SELECT
        id,
        event_id,
        sensor_type,
        last_reading_value AS density,
        last_reading_time,
        ST_Y(location::geometry) AS lat,
        ST_X(location::geometry) AS lng
      FROM sensor
      WHERE event_id = ${eventId}
        AND COALESCE(sensor_type, '') IN ('crowd_density', 'crowd_counter')
      ORDER BY id ASC
    `);

    return this.serialize(sensors);
  }

  async handleWebhook(body: SensorUpdateBody, secret?: string) {
    this.assertWebhookSecret(secret);

    const sensorId = this.parseBigInt(
      body.sensor_id ?? body.sensorId,
      'sensor_id',
    );
    const density = this.parseDensity(body.density ?? body.value);
    const sensorType = body.sensor_type ?? body.sensorType ?? 'crowd_density';

    const [updatedSensor] = await this.prisma.$queryRaw<
      Array<{
        id: bigint;
        event_id: bigint | null;
        sensor_type: string | null;
        density: number | null;
        last_reading_time: Date | null;
      }>
    >(Prisma.sql`
      UPDATE sensor
      SET
        sensor_type = ${sensorType},
        last_reading_value = ${density},
        last_reading_time = now()
      WHERE id = ${sensorId}
      RETURNING
        id,
        event_id,
        sensor_type,
        last_reading_value AS density,
        last_reading_time
    `);

    if (!updatedSensor) {
      throw new BadRequestException(
        `Sensor with ID ${sensorId.toString()} not found`,
      );
    }

    return this.serialize({
      message: 'Sensor reading updated',
      sensor: updatedSensor,
    });
  }

  async simulateCrowdDensityReadings() {
    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE sensor
      SET
        last_reading_value = LEAST(
          100,
          GREATEST(
            0,
            COALESCE(last_reading_value, 50)
              + ((random() * 24) - 12)
          )
        ),
        last_reading_time = now()
      WHERE COALESCE(sensor_type, '') IN ('crowd_density', 'crowd_counter')
    `);
  }
}
