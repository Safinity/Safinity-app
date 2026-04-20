import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { EventsService } from './events/events.service';
import { UsersController } from './users/users.controller';
import { EventsController } from './events/events.controller';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { AlertsController } from './alerts/alerts.controller';
import { AlertsService } from './alerts/alerts.service';
import { SosController } from './sos/sos.controller';
import { SosService } from './sos/sos.service';
import { UserTicketsController } from './tickets/user-tickets.controller';
import { UserTicketsService } from './tickets/user-tickets.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AppController,
    UsersController,
    EventsController,
    NotificationsController,
    AlertsController,
    SosController,
    UserTicketsController
  ],
  providers: [
    AppService,
    UsersService,
    EventsService,
    NotificationsService,
    AlertsService,
    SosService,
    UserTicketsService
  ],
})
export class AppModule {}
