import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { EventsService } from './events/events.service';
import { UsersController } from './users/users.controller';
import { EventsController } from './events/events.controller';
import { AdminEventsController } from './events/events.admin.controller';
import { AdminEventsService } from './events/events.admin.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { AlertsController } from './alerts/alerts.controller';
import { AlertsService } from './alerts/alerts.service';
import { SosController } from './sos/sos.controller';
import { SosService } from './sos/sos.service';
import { AdminUsersController } from './users/users.admin.controller';
import { AdminUsersService } from './users/users.admin.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    AppController,
    UsersController,
    EventsController,
    AdminEventsController,
    AdminUsersController,
    NotificationsController,
    AlertsController,
    SosController,
  ],
  providers: [
    AppService,
    UsersService,
    EventsService,
    AdminEventsService,
    AdminUsersService,
    NotificationsService,
    AlertsService,
    SosService,
  ],
})
export class AppModule {}
