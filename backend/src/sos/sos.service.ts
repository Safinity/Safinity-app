import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSosDto } from './dto/create-sos.dto';

@Injectable()
export class SosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateSosDto, userId: string) {
    const optionsJson = input.options ? JSON.stringify(input.options) : null;

    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return await this.prisma.$transaction(async (tx) => {
      const sosId = await this.nextSosId(tx);
      const alertId = await this.nextAlertId(tx);

      const sosRows = await tx.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`
          INSERT INTO sos (id, user_id, location, description, tag_selected, options)
          VALUES (
            ${sosId},
            ${Prisma.sql`${userId}::uuid`},
            ST_SetSRID(ST_MakePoint(${input.location.lng}, ${input.location.lat}), 4326)::geography,
            ${input.description ?? null},
            ${input.tag_selected ?? null},
            ${optionsJson}::jsonb
          )
          RETURNING id, user_id, description, tag_selected, options, time
        `,
      );

      await tx.$executeRaw(
        Prisma.sql`
          INSERT INTO alerts (id, sos_id)
          VALUES (${alertId}, ${sosId})
        `,
      );

      return sosRows;
    });
  }

  private async nextSosId(tx: Prisma.TransactionClient): Promise<bigint> {
    const result = await tx.sos.aggregate({
      _max: { id: true },
    });

    return (result._max.id ?? BigInt(0)) + BigInt(1);
  }

  private async nextAlertId(tx: Prisma.TransactionClient): Promise<bigint> {
    const result = await tx.$queryRaw<Array<{ next_id: bigint }>>(
      Prisma.sql`SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM alerts`,
    );

    return result[0]?.next_id ?? BigInt(1);
  }
}
