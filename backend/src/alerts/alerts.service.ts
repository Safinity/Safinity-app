import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  // Backoffice-related methods

  async assignAlertToSelf(
    user: AuthenticatedUser | undefined,
    alertIdInput: string,
  ): Promise<unknown> {
    const staffScope = await this.resolveStaffScope(user);
    const alertId = this.toBigInt(alertIdInput, 'alertId');

    const alert = await this.prisma.alerts.findUnique({
      where: { id: alertId },
      select: {
        id: true,
        event_id: true,
        staff_id: true,
        event: {
          select: {
            organization_id: true,
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${alertIdInput} not found`);
    }

    if (!alert.event_id || !alert.event?.organization_id) {
      throw new BadRequestException(
        'Alert is not linked to a valid organization event',
      );
    }

    if (alert.event.organization_id !== staffScope.organizationId) {
      throw new ForbiddenException(
        'You can only assign alerts from events in your organization',
      );
    }

    if (alert.staff_id && alert.staff_id !== staffScope.staffId) {
      throw new ForbiddenException(
        'Alert is already assigned to another staff',
      );
    }

    if (alert.staff_id === staffScope.staffId) {
      return await this.prisma.alerts.findUnique({
        where: { id: alert.id },
        include: { event: true, sos: true, staff_details: true },
      });
    }

    return await this.prisma.alerts.update({
      where: { id: alert.id },
      data: {
        staff_id: staffScope.staffId,
      },
      include: { event: true, sos: true, staff_details: true },
    });
  }

  async updateAssignedAlertStatus(
    user: AuthenticatedUser | undefined,
    alertIdInput: string,
    statusInput: string,
  ): Promise<unknown> {
    const staffScope = await this.resolveStaffScope(user);
    const alertId = this.toBigInt(alertIdInput, 'alertId');
    const status = statusInput?.trim();

    if (!status) {
      throw new BadRequestException('status is required');
    }

    if (status.length > 32) {
      throw new BadRequestException('status must not exceed 32 characters');
    }

    const alert = await this.prisma.alerts.findUnique({
      where: { id: alertId },
      select: {
        id: true,
        staff_id: true,
        event: {
          select: {
            organization_id: true,
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${alertIdInput} not found`);
    }

    if (!alert.event?.organization_id) {
      throw new BadRequestException(
        'Alert is not linked to a valid organization event',
      );
    }

    if (alert.event.organization_id !== staffScope.organizationId) {
      throw new ForbiddenException(
        'You can only update alerts from events in your organization',
      );
    }

    if (!alert.staff_id) {
      throw new ForbiddenException(
        'Alert is not assigned yet. Assign yourself before updating status',
      );
    }

    if (alert.staff_id !== staffScope.staffId) {
      throw new ForbiddenException(
        'Only the assigned staff member can update alert status',
      );
    }

    return await this.prisma.alerts.update({
      where: { id: alert.id },
      data: {
        status,
      },
      include: { event: true, sos: true, staff_details: true },
    });
  }

  async findByOrganizationEvent(
    user: AuthenticatedUser | undefined,
    eventIdInput: string,
  ): Promise<unknown> {
    const organizationId = await this.resolveOrganizationId(user);
    const eventId = this.toBigInt(eventIdInput, 'eventId');

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        organization_id: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventIdInput} not found`);
    }

    if (event.organization_id !== organizationId) {
      throw new ForbiddenException(
        'You can only view alerts from events in your organization',
      );
    }

    return await this.prisma.alerts.findMany({
      where: {
        event_id: eventId,
      },
      orderBy: { time: 'desc' },
      include: { event: true, sos: true, staff_details: true },
    });
  }

  // Shared internal helpers

  private async resolveStaffScope(user?: AuthenticatedUser) {
    if (!user?.id) {
      throw new UnauthorizedException('Authentication required');
    }

    const dbUser = await this.prisma.users.findUnique({
      where: { id: user.id },
      select: {
        staff_details: {
          select: {
            id: true,
            organization_id: true,
          },
        },
      },
    });

    const staffId = dbUser?.staff_details?.id;
    const organizationId = dbUser?.staff_details?.organization_id;

    if (!staffId || !organizationId) {
      throw new ForbiddenException(
        'User is not associated with any organization staff record',
      );
    }

    return {
      staffId,
      organizationId,
    };
  }

  private async resolveOrganizationId(user?: AuthenticatedUser) {
    if (!user?.id) {
      throw new UnauthorizedException('Authentication required');
    }

    const dbUser = await this.prisma.users.findUnique({
      where: { id: user.id },
      select: {
        staff_details: {
          select: {
            organization_id: true,
          },
        },
      },
    });

    const organizationId = dbUser?.staff_details?.organization_id;

    if (!organizationId) {
      throw new ForbiddenException(
        'User is not associated with any organization',
      );
    }

    return organizationId;
  }

  async create(input: CreateAlertDto): Promise<unknown> {
    const id = await this.nextId();
    const sosId = this.toNullableBigInt(input.sos_id, 'sos_id');
    const eventId = this.toNullableBigInt(input.event_id, 'event_id');

    if (input.staff_id !== null && input.staff_id !== undefined) {
      throw new BadRequestException(
        'staff_id cannot be set on creation. Staff must assign themselves manually',
      );
    }

    if (!eventId) {
      throw new BadRequestException('event_id is required');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      throw new BadRequestException(
        'event_id does not reference a valid event',
      );
    }

    return await this.prisma.alerts.create({
      data: {
        id,
        sos_id: sosId,
        event_id: eventId,
        staff_id: null,
        title: input.title,
        description: input.description,
        category: input.category,
        status: input.status,
      },
      include: { event: true, sos: true, staff_details: true },
    });
  }

  private async nextId(): Promise<bigint> {
    const result = await this.prisma.alerts.aggregate({
      _max: { id: true },
    });

    return (result._max.id ?? BigInt(0)) + BigInt(1);
  }

  private toNullableBigInt(
    value: string | null | undefined,
    fieldName: string,
  ): bigint | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    // Tenta converter para BigInt, se falhar lança uma exceção
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(
        `Invalid ${fieldName}. Must be a valid integer`,
      );
    }
  }

  private toBigInt(value: string, fieldName: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(
        `Invalid ${fieldName}. Must be a valid integer`,
      );
    }
  }
}
