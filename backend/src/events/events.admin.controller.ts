import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from '../auth/auth.guards';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { RequestWithUser } from '../auth/auth.types';
import { AdminEventsService } from './events.admin.service';

@ApiTags('admin-events')
@Controller('admin/events')
@UseGuards(AuthRequiredGuard, RolesGuard)
@Roles('staff', 'admin')
export class AdminEventsController {
  constructor(private readonly adminEventsService: AdminEventsService) {}

  @Get()
  getOrganizationEvents(@Req() request: RequestWithUser) {
    return this.adminEventsService.getOrganizationEvents(request.user);
  }

  @Post()
  createEvent(@Req() request: RequestWithUser, @Body() body: unknown) {
    return this.adminEventsService.createEvent(
      request.user,
      body as {
        name?: string;
        venue_name?: string;
        description?: string;
        status?: string;
        category?: string;
        start_date?: string | Date;
        end_date?: string | Date;
        others?: unknown;
      },
    );
  }

  @Patch(':id')
  updateEvent(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.adminEventsService.updateEvent(
      request.user,
      id,
      body as {
        name?: string;
        venue_name?: string;
        description?: string;
        status?: string;
        category?: string;
        start_date?: string | Date;
        end_date?: string | Date;
        others?: unknown;
      },
    );
  }

  @Post(':eventId/points-interest')
  createPointInterest(
    @Req() request: RequestWithUser,
    @Param('eventId') eventId: string,
    @Body() body: unknown,
  ) {
    return this.adminEventsService.createPointInterest(
      request.user,
      eventId,
      body as {
        name?: string;
      },
    );
  }

  @Post(':eventId/activities')
  createActivity(
    @Req() request: RequestWithUser,
    @Param('eventId') eventId: string,
    @Body() body: unknown,
  ) {
    return this.adminEventsService.createEventActivity(
      request.user,
      eventId,
      body as {
        name?: string;
        start_time?: string | Date;
        end_time?: string | Date;
        description?: string;
        point_interest_id?: string | number;
        specifications?: unknown;
      },
    );
  }
}
