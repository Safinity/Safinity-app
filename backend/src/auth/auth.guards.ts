import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { JwtPayload } from './auth.token';
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

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = getBearerToken(request.headers.authorization);

    if (!token) {
      return true;
    }

    try {
      const payload: JwtPayload = this.authService.verifyAccessToken(token);
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch {
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
