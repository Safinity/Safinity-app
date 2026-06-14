import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LinkUserTicketDto } from './dto/link-user-ticket.dto';

@Injectable()
export class UserTicketsService {
  constructor(private readonly prisma: PrismaService) {}

  private toBase64Image(image: Uint8Array | null) {
    return image ? Buffer.from(image).toString('base64') : null;
  }

  private serializeTicket(ticket: {
    id: bigint;
    user_id: string;
    event_id: bigint;
    ticket_code: string;
    linked_at: Date | null;
    event?: {
      id: bigint;
      name: string | null;
      venue_name: string | null;
      description: string | null;
      status: string | null;
      category: string | null;
      image: Uint8Array | null;
      start_date: Date | null;
      end_date: Date | null;
    };
  }) {
    return {
      id: ticket.id.toString(),
      user_id: ticket.user_id,
      event_id: ticket.event_id.toString(),
      ticket_code: ticket.ticket_code,
      linked_at: ticket.linked_at,
      event: ticket.event
        ? {
            id: ticket.event.id.toString(),
            name: ticket.event.name,
            venue_name: ticket.event.venue_name,
            description: ticket.event.description,
            status: ticket.event.status,
            category: ticket.event.category,
            image: this.toBase64Image(ticket.event.image),
            start_date: ticket.event.start_date,
            end_date: ticket.event.end_date,
          }
        : null,
    };
  }

  async linkTicket(dto: LinkUserTicketDto, userId: string) {
    const masterTicket = await this.prisma.event_tickets_master.findUnique({
      where: {
        ticket_code: dto.ticket_code,
      },
    });

    if (!masterTicket) {
      throw new BadRequestException('Invalid ticket code.');
    }

    const existingUserTicket = await this.prisma.user_tickets.findUnique({
      where: {
        ticket_code: dto.ticket_code,
      },
    });

    if (existingUserTicket) {
      throw new BadRequestException('This ticket is already linked.');
    }

    const newUserTicket = await this.prisma.user_tickets.create({
      data: {
        id: BigInt(Date.now()),
        user_id: userId,
        event_id: masterTicket.event_id,
        ticket_code: dto.ticket_code,
      },
    });

    return {
      message: 'Ticket linked successfully.',
      data: {
        id: newUserTicket.id.toString(),
        user_id: newUserTicket.user_id,
        event_id: newUserTicket.event_id.toString(),
        ticket_code: newUserTicket.ticket_code,
        linked_at: newUserTicket.linked_at,
      },
    };
  }

  async findAllByUser(userId: string) {
    const tickets = await this.prisma.user_tickets.findMany({
      where: {
        user_id: userId,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            venue_name: true,
            description: true,
            status: true,
            category: true,
            image: true,
            start_date: true,
            end_date: true,
          },
        },
      },
      orderBy: {
        linked_at: 'desc',
      },
    });

    return tickets.map((ticket) => this.serializeTicket(ticket));
  }

  async remove(id: string, userId: string) {
    const ticket = await this.prisma.user_tickets.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found.');
    }

    if (ticket.user_id !== userId) {
      throw new BadRequestException('You cannot delete this ticket.');
    }

    await this.prisma.user_tickets.delete({
      where: {
        id: BigInt(id),
      },
    });

    return {
      message: 'Ticket removed successfully.',
    };
  }
}
