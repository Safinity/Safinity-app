import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class LinkUserTicketDto {
  @ApiProperty({
    description: '6-digit ticket validation code',
    example: 'ABC123',
  })
  @IsString()
  @Length(6)
  ticket_code!: string;

  @ApiProperty({
    description:
      'Optional event id to validate the ticket against a specific event',
    required: false,
    example: '1',
  })
  @IsOptional()
  @IsString()
  event_id?: string;
}
