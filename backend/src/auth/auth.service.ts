import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthResponse, LoginDto, RegisterDto } from './auth.types';
import {
  comparePassword,
  hashPassword,
  signToken,
  verifyToken,
  type JwtPayload,
} from './auth.token';

type SelfProfileUser = {
  id: string;
  name: string | null;
  username: string | null;
  image: Uint8Array | null;
  role: string;
  email: string | null;
  emergency_contact: string | null;
  user_tickets: Array<unknown>;
  user_favorites: Array<unknown>;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize<T>(value: T): T {
    const replacer = (_key: string, currentValue: unknown): unknown => {
      if (typeof currentValue === 'bigint') {
        return currentValue.toString();
      }

      return currentValue;
    };

    return JSON.parse(JSON.stringify(value, replacer)) as T;
  }

  private async getSelfProfile(userId: string): Promise<SelfProfileUser> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        user_tickets: true,
        user_favorites: {
          include: {
            event_activities: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Authenticated user not found');
    }

    const profile: SelfProfileUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      role: user.role,
      email: user.email,
      emergency_contact: user.emergency_contact,
      user_tickets: user.user_tickets,
      user_favorites: user.user_favorites,
    };

    return this.serialize(profile);
  }

  private async buildResponse(user: {
    id: string;
    email: string | null;
    role: string;
  }): Promise<AuthResponse> {
    if (!user.email) {
      throw new UnauthorizedException('Authenticated user is missing an email');
    }

    return {
      access_token: signToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      user: await this.getSelfProfile(user.id),
    };
  }

  async register(body: RegisterDto) {
    const username = body.username?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const name =
      body.name?.trim() ||
      [body.firstName, body.lastName].filter(Boolean).join(' ').trim();

    if (!username || !email || !password) {
      throw new BadRequestException(
        'username, email and password are required',
      );
    }

    const existingUser = await this.prisma.users.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException(
        'An account with this email or username already exists',
      );
    }

    const createdUser = await this.prisma.users.create({
      data: {
        name: name || null,
        username,
        email,
        password_hash: hashPassword(password),
        role: 'user',
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return this.buildResponse(createdUser);
  }

  async login(body: LoginDto) {
    const identifier =
      body.email?.trim().toLowerCase() ?? body.username?.trim();

    if (!identifier || !body.password) {
      throw new BadRequestException(
        'email or username and password are required',
      );
    }

    const user = await this.prisma.users.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      select: {
        id: true,
        email: true,
        role: true,
        password_hash: true,
      },
    });

    if (!user || !comparePassword(body.password, user.password_hash)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildResponse(user);
  }

  verifyAccessToken(token: string): JwtPayload {
    return verifyToken(token);
  }

  async getAuthenticatedProfile(userId: string): Promise<SelfProfileUser> {
    return await this.getSelfProfile(userId);
  }
}
