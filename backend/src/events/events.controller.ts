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
import { AuthRequiredGuard } from '../auth/auth.guards';
import type { RequestWithUser } from '../auth/auth.types';
import { EventsService } from './events.service';
import type { AddFavouriteBody } from './events.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // GET /events
  @Get()
  getAllEvents() {
    return this.eventsService.getAllEvents();
  }

  // GET /events/past
  @Get('past')
  @UseGuards(AuthRequiredGuard)
  @ApiOperation({ summary: 'Get authenticated user past events' })
  getPastEvents(@Req() request: RequestWithUser) {
    const eventsService: EventsService = this.eventsService;

    return eventsService.getPastEvents(request.user!.id);
  }

  // GET /events/:id
  @Get(':id')
  getEventById(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  // GET /events/:id/points-interest
  @Get(':id/points-interest')
  getPointsInterest(@Param('id') id: string) {
    return this.eventsService.getPointsInterest(id);
  }

  // GET /events/:id/mapa
  @Get(':id/mapa')
  getMap(@Param('id') id: string) {
    return this.eventsService.getMap(id);
  }

  // GET /events/:id/activities
  @Get(':id/activities')
  getActivities(@Param('id') id: string) {
    return this.eventsService.getActivities(id);
  }

  // GET /events/:id/favourites
  @Get(':id/favourites')
  @UseGuards(AuthRequiredGuard)
  getFavourites(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.eventsService.getFavourites(id, request.user!.id);
  }

  // GET /events/activities/:id
  @Get('activities/:id')
  getActivityById(@Param('id') id: string) {
    return this.eventsService.getActivityById(id);
  }

  // POST /events/favourite
  @Post('favourite')
  @UseGuards(AuthRequiredGuard)
  addFavourite(
    @Body() body: AddFavouriteBody,
    @Req() request: RequestWithUser,
  ) {
    return this.eventsService.addFavourite(request.user!.id, body);
  }

  // DELETE /events/favourite/:activityId
  @Delete('favourite/:activityId')
  @UseGuards(AuthRequiredGuard)
  removeFavourite(
    @Param('activityId') activityId: string,
    @Req() request: RequestWithUser,
  ) {
    const eventsService: EventsService = this.eventsService;

    return eventsService.removeFavourite(request.user!.id, activityId);
  }
}
