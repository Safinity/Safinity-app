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
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from '../auth/auth.guards';
import type { RequestWithUser } from '../auth/auth.types';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertStatusDto } from './dto/update-alert-status.dto';

@ApiTags('Alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  // App-related endpoints

  @ApiOperation({ summary: 'Create an alert' })
  @ApiBody({ type: CreateAlertDto })
  @UseGuards(AuthRequiredGuard)
  @Post()
  create(@Body() body: CreateAlertDto) {
    return this.alertsService.create(body);
  }

  // Backoffice-related endpoints

  @ApiOperation({
    summary:
      'Get alerts for an event within the authenticated user organization',
  })
  @UseGuards(AuthRequiredGuard)
  @Get('organization/events/:eventId')
  getOrganizationEventAlerts(
    @Req() request: RequestWithUser,
    @Param('eventId') eventId: string,
  ): Promise<unknown> {
    return this.alertsService.findByOrganizationEvent(request.user, eventId);
  }

  @ApiOperation({
    summary: 'Assign an organization alert to the authenticated staff member',
  })
  @UseGuards(AuthRequiredGuard)
  @Post('organization/alerts/:alertId/assign-self')
  assignAlertToSelf(
    @Req() request: RequestWithUser,
    @Param('alertId') alertId: string,
  ): Promise<unknown> {
    return this.alertsService.assignAlertToSelf(request.user, alertId);
  }

  @ApiOperation({
    summary: 'Update status of an alert assigned to the authenticated staff',
  })
  @ApiBody({ type: UpdateAlertStatusDto })
  @UseGuards(AuthRequiredGuard)
  @Patch('organization/alerts/:alertId/status')
  updateAssignedAlertStatus(
    @Req() request: RequestWithUser,
    @Param('alertId') alertId: string,
    @Body() body: UpdateAlertStatusDto,
  ): Promise<unknown> {
    const alertsService: AlertsService = this.alertsService;

    return alertsService.updateAssignedAlertStatus(
      request.user,
      alertId,
      body.status,
    );
  }
}
