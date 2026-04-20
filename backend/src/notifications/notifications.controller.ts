import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NOTIFICATIONS_SERVICE } from './notifications.constants';

type NotificationsServiceContract = {
  findAll: (query?: {
    page?: string;
    pageSize?: string;
    search?: string;
    category?: string;
    eventId?: string;
    sortBy?: 'time' | 'title';
    sortOrder?: 'asc' | 'desc';
  }) => Promise<unknown>;
  create: (input: CreateNotificationDto) => Promise<unknown>;
};

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: NotificationsServiceContract,
  ) {}

  @Get()
  getAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('eventId') eventId?: string,
    @Query('sortBy') sortBy?: 'time' | 'title',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.notificationsService.findAll({
      page,
      pageSize,
      search,
      category,
      eventId,
      sortBy,
      sortOrder,
    });
  }

  @ApiOperation({ summary: 'Create a notification' })
  @ApiBody({ type: CreateNotificationDto })
  @Post()
  create(@Body() body: CreateNotificationDto) {
    return this.notificationsService.create(body);
  }
}
