import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSosDto } from './dto/create-sos.dto';

@Injectable()
export class SosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateSosDto) {
    const id = await this.nextId();
    const optionsJson = input.options ? JSON.stringify(input.options) : null;
    const user = await this.prisma.users.findUnique({
      where: { id: input.user_id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${input.user_id} not found`);
    }

    return await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      INSERT INTO sos (id, user_id, location, description, tag_selected, options)
      VALUES (
        ${id},
        ${Prisma.sql`${input.user_id}::uuid`},
        ST_SetSRID(ST_MakePoint(${input.location.lng}, ${input.location.lat}), 4326)::geography,
        ${input.description ?? null},
        ${input.tag_selected ?? null},
        ${optionsJson}::jsonb
      )
      RETURNING id, user_id, description, tag_selected, options, time
    `);
  }

  private async nextId(): Promise<bigint> {
    const result = await this.prisma.sos.aggregate({
      _max: { id: true },
    });

    return (result._max.id ?? BigInt(0)) + BigInt(1);
  }
}
