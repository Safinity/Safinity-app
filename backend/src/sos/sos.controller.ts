import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SosService } from './sos.service';
import { CreateSosDto } from './dto/create-sos.dto';
import { AuthRequiredGuard } from '../auth/auth.guards';
import type { RequestWithUser } from '../auth/auth.types';

@ApiTags('SOS')
@Controller('sos')
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @ApiOperation({ summary: 'Create an SOS report' })
  @ApiBody({ type: CreateSosDto })
  @UseGuards(AuthRequiredGuard)
  @Post()
  create(@Body() body: CreateSosDto, @Req() request: RequestWithUser) {
    return this.sosService.create(body, request.user!.id);
  }
}
