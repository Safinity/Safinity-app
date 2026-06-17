import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { OptionalAuthGuard } from './auth/auth.guards';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NotificationsRealtimeService } from './notifications/notifications-realtime.service';

// Fix BigInt serialization
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

export {};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Safinity API')
    .setDescription('Safinity backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // Register OptionalAuthGuard globally so requests with a Clerk token
  // populate `request.user` before route-level guards run.
  try {
    const optionalAuth = app.get(OptionalAuthGuard);
    app.useGlobalGuards(optionalAuth);
  } catch (err: unknown) {
    // If for some reason the guard provider isn't available at bootstrap,
    // continue without breaking the server — controllers can still add guards.
    const errorMessage = err instanceof Error ? err.message : String(err);

    console.warn('OptionalAuthGuard not available at bootstrap:', errorMessage);
  }

  const realtimeNotifications = app.get(NotificationsRealtimeService);
  realtimeNotifications.attach(app.getHttpServer());

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();