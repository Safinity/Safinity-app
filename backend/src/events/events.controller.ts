import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.eventsService.findOne(BigInt(id));
  }
}
