import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';

@ApiTags('Alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  getAll() {
    return this.alertsService.findAll();
  }

  @ApiOperation({ summary: 'Create an alert' })
  @ApiBody({ type: CreateAlertDto })
  @Post()
  create(@Body() body: CreateAlertDto) {
    return this.alertsService.create(body);
  }
}
