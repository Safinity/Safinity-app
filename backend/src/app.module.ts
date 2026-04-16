import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { EventsService } from './events/events.service';
import { UsersController } from './users/users.controller';
import { EventsController } from './events/events.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, UsersController, EventsController],
  providers: [AppService, UsersService, EventsService],
})
export class AppModule {}
