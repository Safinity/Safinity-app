import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthRequiredGuard, OptionalAuthGuard } from './auth.guards';
import { AuthService } from './auth.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRequiredGuard,
    OptionalAuthGuard,
    {
      provide: APP_GUARD,
      useClass: OptionalAuthGuard,
    },
  ],
  exports: [AuthService, AuthRequiredGuard, OptionalAuthGuard],
})
export class AuthModule {}
