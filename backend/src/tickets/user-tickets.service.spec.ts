/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { UserTicketsService } from './user-tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('UserTicketsService', () => {
  let service: UserTicketsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTicketsService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            event_tickets_master: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            user_tickets: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserTicketsService>(UserTicketsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('linkTicket', () => {
    it('should throw BadRequestException if ticket code does not exist in master', async () => {
      jest
        .mocked(prisma.event_tickets_master.findUnique)
        .mockResolvedValue(null);

      await expect(
        service.linkTicket({ ticket_code: 'INVALID' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if ticket is already linked in master record', async () => {
      jest.mocked(prisma.event_tickets_master.findUnique).mockResolvedValue({
        ticket_code: 'USED-CODE',
        is_already_linked: true,
        event_id: 1n,
      } as any);

      await expect(
        service.linkTicket({ ticket_code: 'USED-CODE' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if event_id mismatch occurs against user request', async () => {
      jest.mocked(prisma.event_tickets_master.findUnique).mockResolvedValue({
        ticket_code: 'CODE-123',
        is_already_linked: false,
        event_id: 1n,
      } as any);

      await expect(
        service.linkTicket(
          { ticket_code: 'CODE-123', event_id: '999' },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllByUser', () => {
    it('should return lists and map BigInt values out seamlessly into string identifiers', async () => {
      jest.mocked(prisma.user_tickets.findMany).mockResolvedValue([
        {
          id: 555n,
          user_id: 'user-1',
          event_id: 10n,
          ticket_code: 'MAPPED-CODE',
          linked_at: new Date(),
          event: null,
        },
      ] as any);

      const result = await service.findAllByUser('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('555');
      expect(result[0].event_id).toBe('10');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if specific database row does not exist', async () => {
      jest.mocked(prisma.user_tickets.findUnique).mockResolvedValue(null);

      await expect(service.remove('12345', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException if active user tries to delete someone else's ticket allocation", async () => {
      jest.mocked(prisma.user_tickets.findUnique).mockResolvedValue({
        id: 12345n,
        user_id: 'rightful-owner',
      } as any);

      await expect(service.remove('12345', 'attacker-user')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully call delete block when identification validates cleanly', async () => {
      jest.mocked(prisma.user_tickets.findUnique).mockResolvedValue({
        id: 12345n,
        user_id: 'user-1',
      } as any);
      jest.mocked(prisma.user_tickets.delete).mockResolvedValue({} as any);

      const result = await service.remove('12345', 'user-1');

      expect(prisma.user_tickets.delete).toHaveBeenCalled();
      expect(result.message).toContain('removed successfully');
    });
  });
});
