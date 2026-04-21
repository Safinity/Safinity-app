import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { hashPassword } from '../auth/auth.token';
import { PrismaService } from '../prisma/prisma.service';

type AdminScope = {
  userId: string;
  organizationId: bigint;
};

type CreateOrganizationUserBody = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  role_in_org?: string;
};

type UpdateOrganizationUserBody = {
  name?: string;
  role?: string;
  role_in_org?: string;
};

@Injectable()
export class AdminUsersService {
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

  private ensureOrgAdminRole(roleInOrg?: string | null) {
    const normalized = roleInOrg?.trim().toLowerCase();

    if (normalized !== 'admin' && normalized !== 'owner') {
      throw new ForbiddenException(
        'Only organization admins can perform this action',
      );
    }
  }

  private async resolveAdminScope(
    user?: AuthenticatedUser,
  ): Promise<AdminScope> {
    if (!user?.id) {
      throw new UnauthorizedException('Authentication required');
    }

    const dbUser = await this.prisma.users.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        staff_details: {
          select: {
            organization_id: true,
            role_in_org: true,
          },
        },
      },
    });

    if (!dbUser) {
      throw new UnauthorizedException('Authenticated user not found');
    }

    const organizationId = dbUser.staff_details?.organization_id;

    if (!organizationId) {
      throw new ForbiddenException(
        'User is not associated with any organization',
      );
    }

    this.ensureOrgAdminRole(dbUser.staff_details?.role_in_org);

    return {
      userId: dbUser.id,
      organizationId,
    };
  }

  private async nextBigIntId<T extends { id: bigint }>(
    finder: () => Promise<T | null>,
  ) {
    const lastRecord = await finder();
    return lastRecord ? lastRecord.id + 1n : 1n;
  }

  async getOrganizationUsers(user?: AuthenticatedUser) {
    const scope = await this.resolveAdminScope(user);

    const staffRecords = await this.prisma.staff_details.findMany({
      where: { organization_id: scope.organizationId },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        organization_id: true,
        role_in_org: true,
        users: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return this.serialize(staffRecords);
  }

  async createOrganizationUser(
    user: AuthenticatedUser | undefined,
    body: CreateOrganizationUserBody,
  ) {
    const scope = await this.resolveAdminScope(user);

    const username = body.username?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

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
        'A user with this email or username already exists',
      );
    }

    const createdUser = await this.prisma.users.create({
      data: {
        name: body.name?.trim() || null,
        username,
        email,
        password_hash: hashPassword(password),
        role: body.role?.trim() || 'user',
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
      },
    });

    const staffId = await this.nextBigIntId(() =>
      this.prisma.staff_details.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      }),
    );

    const staffDetails = await this.prisma.staff_details.create({
      data: {
        id: staffId,
        user_id: createdUser.id,
        organization_id: scope.organizationId,
        role_in_org: body.role_in_org?.trim() || 'member',
      },
      select: {
        id: true,
        organization_id: true,
        role_in_org: true,
      },
    });

    return this.serialize({
      ...createdUser,
      staff_details: staffDetails,
    });
  }

  async updateOrganizationUser(
    user: AuthenticatedUser | undefined,
    targetUserId: string,
    body: UpdateOrganizationUserBody,
  ) {
    const scope = await this.resolveAdminScope(user);

    const staffRecord = await this.prisma.staff_details.findFirst({
      where: {
        user_id: targetUserId,
        organization_id: scope.organizationId,
      },
      select: {
        id: true,
        user_id: true,
      },
    });

    if (!staffRecord?.user_id) {
      throw new NotFoundException(
        'User not found in your organization staff list',
      );
    }

    const [updatedUser, updatedStaff] = await this.prisma.$transaction([
      this.prisma.users.update({
        where: { id: staffRecord.user_id },
        data: {
          name: body.name?.trim(),
          role: body.role?.trim(),
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
        },
      }),
      this.prisma.staff_details.update({
        where: { id: staffRecord.id },
        data: {
          role_in_org: body.role_in_org?.trim(),
        },
        select: {
          id: true,
          organization_id: true,
          role_in_org: true,
        },
      }),
    ]);

    return this.serialize({
      ...updatedUser,
      staff_details: updatedStaff,
    });
  }
}
