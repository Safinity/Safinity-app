import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateAlertStatusDto {
  @ApiProperty({
    description: 'New alert status',
    maxLength: 32,
    example: 'in_progress',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  status!: string;
}
