import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from '../auth/auth.guards';
import type { RequestWithUser } from '../auth/auth.types';
import { NotificationsService } from './notifications.service';
import { CreateOrganizationNotificationDto } from './dto/create-organization-notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // App-related endpoints

  @ApiOperation({
    summary:
      'Get notifications for all events where the authenticated user has tickets',
  })
  @UseGuards(AuthRequiredGuard)
  @Get('me')
  getMyNotifications(@Req() request: RequestWithUser): Promise<unknown> {
    return this.notificationsService.findForTicketedEvents(request.user);
  }

  @Get()
  getAll() {
    return this.notificationsService.findAll();
  }

  // Backoffice-related endpoints

  @ApiOperation({
    summary:
      'Get notifications for an event within the authenticated organization',
  })
  @UseGuards(AuthRequiredGuard)
  @Get('organization/events/:eventId')
  getOrganizationEventNotifications(
    @Req() request: RequestWithUser,
    @Param('eventId') eventId: string,
  ): Promise<unknown> {
    return this.notificationsService.findByOrganizationEvent(
      request.user,
      eventId,
    );
  }

  @ApiOperation({
    summary:
      'Create a notification for an event in the authenticated organization',
  })
  @ApiBody({ type: CreateOrganizationNotificationDto })
  @UseGuards(AuthRequiredGuard)
  @Post('organization/events/:eventId')
  createOrganizationEventNotification(
    @Req() request: RequestWithUser,
    @Param('eventId') eventId: string,
    @Body() body: CreateOrganizationNotificationDto,
  ): Promise<unknown> {
    return this.notificationsService.createForOrganizationEvent(
      request.user,
      eventId,
      body,
    );
  }
}
