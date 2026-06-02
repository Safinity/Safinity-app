import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthRequiredGuard, OptionalAuthGuard } from './auth.guards';
import { AuthService } from './auth.service';
import { ClerkService } from './clerk.service';

@Module({
  imports: [PrismaModule],

  controllers: [AuthController],

  providers: [AuthService, ClerkService, OptionalAuthGuard, AuthRequiredGuard],

  exports: [AuthService, OptionalAuthGuard, AuthRequiredGuard, ClerkService],
})
export class AuthModule {}
