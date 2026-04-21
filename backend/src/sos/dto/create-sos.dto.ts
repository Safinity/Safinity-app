import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { GeoPointDto } from '../../common/dto/geo-point.dto';

export class CreateSosDto {
  @ApiProperty({
    description: 'Current user location',
    type: () => GeoPointDto,
  })
  @ValidateNested()
  @Type(() => GeoPointDto)
  location!: GeoPointDto;

  @ApiPropertyOptional({
    description: 'Free text description of the SOS',
    example: 'Need assistance near the north gate.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Selected tag for the SOS',
    maxLength: 32,
    example: 'medical',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  tag_selected?: string;

  @ApiPropertyOptional({
    description: 'Additional structured options for the SOS',
    example: { tags: [1, 3], notes: 'User requested immediate help' },
    type: Object,
  })
  @IsOptional()
  @IsObject()
  options?: Record<string, unknown>;
}
