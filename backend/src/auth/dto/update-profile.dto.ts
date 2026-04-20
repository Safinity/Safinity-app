import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Display name',
    maxLength: 50,
    example: 'Joao Silva',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    description: 'Unique username',
    maxLength: 32,
    example: 'joaosilva',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  username?: string;
}