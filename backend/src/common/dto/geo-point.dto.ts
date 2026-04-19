import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GeoPointDto {
  @ApiProperty({
    description: 'Latitude in decimal degrees',
    example: 38.7223,
  })
  @IsNumber()
  lat!: number;

  @ApiProperty({
    description: 'Longitude in decimal degrees',
    example: -9.1393,
  })
  @IsNumber()
  lng!: number;
}
