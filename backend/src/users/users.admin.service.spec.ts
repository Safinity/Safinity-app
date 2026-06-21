/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminUsersService } from './users.admin.service';

describe('AdminUsersService', () => {
  const prisma = {
    users: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    staff_details: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const createClerkUser = jest.fn();
  const clerk = { client: { users: { createUser: createClerkUser } } };
  const admin = { id: 'admin-id' } as any;
  let service: AdminUsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminUsersService(prisma as never, clerk as never);
    prisma.users.findUnique.mockResolvedValue({
      id: 'admin-id',
      staff_details: { organization_id: 5n, role_in_org: 'OWNER' },
    });
  });

  it('lists and serializes organization staff', async () => {
    prisma.staff_details.findMany.mockResolvedValue([
      { id: 1n, organization_id: 5n, users: { id: 'u1' } },
    ]);
    await expect(service.getOrganizationUsers(admin)).resolves.toEqual([
      { id: '1', organization_id: '5', users: { id: 'u1' } },
    ]);
  });

  it('validates authentication and organization membership', async () => {
    await expect(service.getOrganizationUsers()).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    prisma.users.findUnique.mockResolvedValueOnce(null);
    await expect(service.getOrganizationUsers(admin)).rejects.toThrow(
      'Authenticated user not found',
    );
    prisma.users.findUnique.mockResolvedValueOnce({ id: 'admin-id' });
    await expect(service.getOrganizationUsers(admin)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    prisma.users.findUnique.mockResolvedValueOnce({
      id: 'admin-id',
      staff_details: { organization_id: 5n, role_in_org: 'member' },
    });
    await expect(service.getOrganizationUsers(admin)).rejects.toThrow(
      'Only organization admins',
    );
  });

  it('creates a Clerk user and organization staff record', async () => {
    prisma.users.findFirst.mockResolvedValue(null);
    createClerkUser.mockResolvedValue({ id: 'clerk-new' });
    prisma.users.create.mockResolvedValue({
      id: 'new-id',
      name: 'New User',
      username: 'new',
      email: 'new@example.com',
      role: 'user',
      clerk_id: 'clerk-new',
    });
    prisma.staff_details.findFirst.mockResolvedValue({ id: 6n });
    prisma.staff_details.create.mockResolvedValue({
      id: 7n,
      organization_id: 5n,
      role_in_org: 'staff',
    });

    await expect(
      service.createOrganizationUser(admin, {
        name: ' New User ',
        username: ' new ',
        email: ' NEW@EXAMPLE.COM ',
        password: 'strong-password',
        role_in_org: ' staff ',
      }),
    ).resolves.toMatchObject({
      id: 'new-id',
      staff_details: { id: '7', organization_id: '5' },
    });
    expect(createClerkUser).toHaveBeenCalledWith(
      expect.objectContaining({ emailAddress: ['new@example.com'] }),
    );
  });

  it('uses defaults and first staff id', async () => {
    prisma.users.findFirst.mockResolvedValue(null);
    createClerkUser.mockResolvedValue({ id: 'clerk-new' });
    prisma.users.create.mockResolvedValue({ id: 'new-id' });
    prisma.staff_details.findFirst.mockResolvedValue(null);
    prisma.staff_details.create.mockResolvedValue({ id: 1n });
    await service.createOrganizationUser(admin, {
      username: 'new',
      email: 'new@example.com',
      password: 'password',
    });
    expect(prisma.staff_details.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ id: 1n, role_in_org: 'member' }),
      }),
    );
  });

  it('rejects incomplete and duplicate users', async () => {
    await expect(
      service.createOrganizationUser(admin, { username: 'x' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    prisma.users.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(
      service.createOrganizationUser(admin, {
        username: 'x',
        email: 'x@example.com',
        password: 'password',
      }),
    ).rejects.toThrow('already exists');
  });

  it('updates a user from the same organization', async () => {
    prisma.staff_details.findFirst.mockResolvedValue({ id: 2n, user_id: 'u2' });
    prisma.users.update.mockReturnValue(
      Promise.resolve({ id: 'u2', name: 'Updated' }),
    );
    prisma.staff_details.update.mockReturnValue(
      Promise.resolve({ id: 2n, organization_id: 5n, role_in_org: 'manager' }),
    );
    prisma.$transaction.mockResolvedValue([
      { id: 'u2', name: 'Updated' },
      { id: 2n, organization_id: 5n, role_in_org: 'manager' },
    ]);
    await expect(
      service.updateOrganizationUser(admin, 'u2', {
        name: ' Updated ',
        role: ' staff ',
        role_in_org: ' manager ',
      }),
    ).resolves.toMatchObject({
      id: 'u2',
      staff_details: { id: '2', organization_id: '5' },
    });
  });

  it('rejects users outside the organization', async () => {
    prisma.staff_details.findFirst.mockResolvedValue(null);
    await expect(
      service.updateOrganizationUser(admin, 'missing', {}),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
