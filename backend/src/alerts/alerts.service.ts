import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.alerts.findMany({
      orderBy: { time: 'desc' },
      include: { event: true, sos: true, staff_details: true },
    });
  }

  async create(input: CreateAlertDto) {
    const id = await this.nextId();
    const sosId = this.toNullableBigInt(input.sos_id, 'sos_id');
    const eventId = this.toNullableBigInt(input.event_id, 'event_id');
    const staffId = this.toNullableBigInt(input.staff_id, 'staff_id');

    return await this.prisma.alerts.create({
      data: {
        id,
        sos_id: sosId,
        event_id: eventId,
        staff_id: staffId,
        title: input.title,
        description: input.description,
        category: input.category,
        status: input.status,
      },
      include: { event: true, sos: true, staff_details: true },
    });
  }

  private async nextId(): Promise<bigint> {
    const result = await this.prisma.alerts.aggregate({
      _max: { id: true },
    });

    return (result._max.id ?? BigInt(0)) + BigInt(1);
  }

  private toNullableBigInt(
    value: string | null | undefined,
    fieldName: string,
  ): bigint | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(
        `Invalid ${fieldName}. Must be a valid integer`,
      );
    }
  }
}
