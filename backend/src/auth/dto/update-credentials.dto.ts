import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCredentialsDto {
  @ApiPropertyOptional({
    description: 'New email address',
    example: 'new-email@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Current password for confirmation',
    example: 'CurrentPassword123',
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiPropertyOptional({
    description: 'New password',
    minLength: 8,
    example: 'NewPassword123',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
