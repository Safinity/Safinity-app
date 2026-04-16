import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.event.findMany({});
  }

  async findOne(id: bigint) {
    return await this.prisma.event.findUnique({
      where: { id },
      include: { event_activities: true, points_interest: true },
    });
  }
}
