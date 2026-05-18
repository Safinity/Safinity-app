import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminEventsController } from './events.admin.controller';
import { AdminEventsService } from './events.admin.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [AuthModule],
  controllers: [EventsController, AdminEventsController],
  providers: [EventsService, AdminEventsService],
  exports: [EventsService, AdminEventsService],
})
export class EventsModule {}
