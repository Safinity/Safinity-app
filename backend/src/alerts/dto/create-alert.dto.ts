import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAlertDto {
  @ApiPropertyOptional({
    description: 'Related SOS ID',
    type: Number,
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sos_id?: string | null;

  @ApiPropertyOptional({
    description: 'Related event ID',
    type: Number,
    example: 2,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  event_id?: string | null;

  @ApiPropertyOptional({
    description: 'Related staff ID',
    type: Number,
    example: 3,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  staff_id?: string | null;

  @ApiPropertyOptional({
    description: 'Alert title',
    maxLength: 32,
    example: 'Crowd control needed',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  title?: string;

  @ApiPropertyOptional({
    description: 'Alert description',
    maxLength: 255,
    example: 'Large crowd detected near the main entrance.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: 'Alert category',
    maxLength: 32,
    example: 'security',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  category?: string;

  @ApiPropertyOptional({
    description: 'Alert status',
    maxLength: 32,
    example: 'open',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;
}
