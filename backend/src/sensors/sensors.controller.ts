import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthRequiredGuard } from '../auth/auth.guards';
import { SensorsService } from './sensors.service';

@Controller()
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @Get('events/:eventId/sensors')
  @UseGuards(AuthRequiredGuard)
  getEventSensors(@Param('eventId') eventId: string) {
    return this.sensorsService.findByEvent(eventId);
  }

  @Post('webhooks/sensors')
  handleSensorWebhook(
    @Body() body: Record<string, unknown>,
    @Headers('x-sensor-webhook-secret') secret?: string,
  ) {
    return this.sensorsService.handleWebhook(body, secret);
  }
}
