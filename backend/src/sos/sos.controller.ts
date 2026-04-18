import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SosService } from './sos.service';
import { CreateSosDto } from './dto/create-sos.dto';

@ApiTags('SOS')
@Controller('sos')
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @ApiOperation({ summary: 'Create an SOS report' })
  @ApiBody({ type: CreateSosDto })
  @Post()
  create(@Body() body: CreateSosDto) {
    return this.sosService.create(body);
  }
}
