import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UserTicketsService } from './user-tickets.service';
import { AuthRequiredGuard } from '../auth/auth.guards';
import { LinkUserTicketDto } from './dto/link-user-ticket.dto';

@Controller('user-tickets')
export class UserTicketsController {
  constructor(private readonly userTicketsService: UserTicketsService) {}

  @Post()
  @UseGuards(AuthRequiredGuard)
  linkTicket(
    @Body() dto: LinkUserTicketDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.userTicketsService.linkTicket(dto, req.user.id);
  }

  @Get()
  @UseGuards(AuthRequiredGuard)
  findAll(@Req() req: Request & { user: { id: string } }) {
    return this.userTicketsService.findAllByUser(req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthRequiredGuard)
  remove(
    @Param('id') id: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.userTicketsService.remove(id, req.user.id);
  }
}
