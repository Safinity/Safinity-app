import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrganizationNotificationDto {
  @ApiPropertyOptional({
    description: 'Notification title',
    maxLength: 32,
    example: 'Porta principal fechada',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  title?: string;

  @ApiPropertyOptional({
    description: 'Notification details',
    maxLength: 255,
    example: 'A entrada principal foi temporariamente fechada.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: 'Notification category',
    maxLength: 32,
    example: 'security',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  category?: string;
}
