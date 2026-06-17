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
      image: string | null;
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
            image: ticket.event.image,
            start_date: ticket.event.start_date,
            end_date: ticket.event.end_date,
          }
        : null,
    };
  }

  async linkTicket(dto: LinkUserTicketDto, userId: string) {
    const ticketCode = dto.ticket_code.trim().toUpperCase();
    const masterTicket = await this.prisma.event_tickets_master.findUnique({
      where: {
        ticket_code: ticketCode,
      },
    });

    if (!masterTicket) {
      throw new BadRequestException('Invalid ticket code.');
    }

    if (masterTicket.is_already_linked) {
      throw new BadRequestException('This ticket is already linked.');
    }

    if (dto.event_id && masterTicket.event_id.toString() !== dto.event_id) {
      throw new BadRequestException(
        'This ticket does not belong to this event.',
      );
    }

    const existingUserTicket = await this.prisma.user_tickets.findUnique({
      where: {
        ticket_code: ticketCode,
      },
    });

    if (existingUserTicket) {
      throw new BadRequestException('This ticket is already linked.');
    }

    const existingEventTicketForUser = await this.prisma.user_tickets.findFirst(
      {
        where: {
          user_id: userId,
          event_id: masterTicket.event_id,
        },
        select: { id: true },
      },
    );

    if (existingEventTicketForUser) {
      throw new BadRequestException(
        'You already have a ticket linked for this event.',
      );
    }

    const newUserTicket = await this.prisma.$transaction(async (tx) => {
      const createdTicket = await tx.user_tickets.create({
        data: {
          id: BigInt(Date.now()),
          user_id: userId,
          event_id: masterTicket.event_id,
          ticket_code: ticketCode,
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
      });

      await tx.event_tickets_master.update({
        where: { ticket_code: ticketCode },
        data: { is_already_linked: true },
      });

      return createdTicket;
    });

    return {
      message: 'Ticket linked successfully.',
      data: this.serializeTicket(newUserTicket),
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
