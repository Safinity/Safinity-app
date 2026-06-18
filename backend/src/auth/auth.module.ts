import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthRequiredGuard, OptionalAuthGuard } from './auth.guards';
import { AuthService } from './auth.service';
import { ClerkService } from './clerk.service';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [PrismaModule],

  controllers: [AuthController],

  providers: [
    AuthService,
    ClerkService,
    OptionalAuthGuard,
    AuthRequiredGuard,
    RolesGuard,
  ],

  exports: [
    AuthService,
    OptionalAuthGuard,
    AuthRequiredGuard,
    RolesGuard,
    ClerkService,
  ],
})
export class AuthModule {}
