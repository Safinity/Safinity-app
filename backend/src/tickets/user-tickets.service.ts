import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LinkUserTicketDto } from './dto/link-user-ticket.dto';

@Injectable()
export class UserTicketsService {
  constructor(private readonly prisma: PrismaService) {}

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
        event: true,
      },
      orderBy: {
        linked_at: 'desc',
      },
    });

    return tickets.map((ticket) => ({
      id: ticket.id.toString(),
      user_id: ticket.user_id,
      event_id: ticket.event_id.toString(),
      ticket_code: ticket.ticket_code,
      linked_at: ticket.linked_at,
      event: ticket.event,
    }));
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