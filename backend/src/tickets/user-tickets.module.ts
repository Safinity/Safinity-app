import { Module } from '@nestjs/common';
import { UserTicketsController } from './user-tickets.controller';
import { UserTicketsService } from './user-tickets.service';

@Module({
  controllers: [UserTicketsController],
  providers: [UserTicketsService],
})
export class UserTicketsModule {}