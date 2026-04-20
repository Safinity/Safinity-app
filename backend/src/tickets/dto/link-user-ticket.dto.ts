import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class LinkUserTicketDto {
  @ApiProperty({
    description: '6-digit ticket validation code',
    example: 'ABC123',
  })
  @IsString()
  @Length(6)
  ticket_code!: string;
}