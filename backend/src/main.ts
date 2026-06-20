import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { OptionalAuthGuard } from './auth/auth.guards';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import type { Server as HttpServer } from 'http';
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
  app.use(json({ limit: '8mb' }));
  app.use(urlencoded({ extended: true, limit: '8mb' }));

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
  if (process.env.ENABLE_SWAGGER !== 'false') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Safinity API')
      .setDescription('Safinity backend API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }

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
  const httpServer = app.getHttpServer() as unknown as HttpServer;
  realtimeNotifications.attach(httpServer);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
