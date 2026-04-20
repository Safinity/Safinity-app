import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { EventsService } from './events/events.service';
import { UsersController } from './users/users.controller';
import { EventsController } from './events/events.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { AlertsController } from './alerts/alerts.controller';
import { AlertsService } from './alerts/alerts.service';
import { SosController } from './sos/sos.controller';
import { SosService } from './sos/sos.service';
import { FriendsController } from './friends/friends.controller';
import { FriendsService } from './friends/friends.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    AppController,
    UsersController,
    EventsController,
    NotificationsController,
    AlertsController,
    SosController,
    FriendsController,
  ],
  providers: [
    AppService,
    UsersService,
    EventsService,
    NotificationsService,
    AlertsService,
    SosService,
    FriendsService,
  ],
})
export class AppModule {}
