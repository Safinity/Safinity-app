import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

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

  @ApiPropertyOptional({
    description: 'Profile image encoded as base64',
  })
  @IsOptional()
  @IsString()
  imageBase64?: string;

  @ApiPropertyOptional({
    description: 'Profile image MIME type',
    enum: ['image/jpeg', 'image/png', 'image/webp'],
    example: 'image/jpeg',
  })
  @IsOptional()
  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  imageMimeType?: string;
}
