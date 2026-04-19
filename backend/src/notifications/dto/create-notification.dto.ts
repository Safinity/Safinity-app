import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiPropertyOptional({
    description: 'Related event ID',
    type: Number,
    example: 1,
    nullable: true,
  })
  event_id?: string | number | null;

  @ApiPropertyOptional({
    description: 'Notification title',
    maxLength: 32,
    example: 'Porta principal fechada',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Notification details',
    maxLength: 255,
    example: 'A entrada principal foi temporariamente fechada.',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Notification category',
    maxLength: 32,
    example: 'security',
  })
  category?: string;
}
