import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { verifyToken } from '@clerk/backend';

import { AuthService } from './auth.service';
import type { RequestWithUser } from './auth.types';

function getBearerToken(headerValue?: string | string[]) {
  const header = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

function isClerkRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as {
    status?: unknown;
    code?: unknown;
  };

  return maybeError.status === 429 || maybeError.code === 'api_response_error';
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const token = getBearerToken(request.headers.authorization);

    if (!token) {
      return true;
    }

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      const user = await this.authService.findOrCreateUser(payload.sub);

      request.user = {
        id: user.id,
        clerk_id: user.clerk_id,
        email: user.email || null,
        role: user.role,
      };

      return true;
    } catch (error: unknown) {
      // If Clerk is rate-limiting or unavailable, still allow the request through
      // AuthRequiredGuard will catch missing user on protected endpoints
      if (isClerkRateLimitError(error)) {
        return true;
      }

      console.error('Clerk token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

@Injectable()
export class AuthRequiredGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user?.id) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
