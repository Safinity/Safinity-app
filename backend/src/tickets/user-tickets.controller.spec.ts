/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { UserTicketsController } from './user-tickets.controller';
import { UserTicketsService } from './user-tickets.service';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { LinkUserTicketDto } from './dto/link-user-ticket.dto';

describe('UserTicketsController', () => {
  let controller: UserTicketsController;
  let service: UserTicketsService;

  const mockReq = {
    user: { id: 'user-uuid-123' },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserTicketsController],
      providers: [
        {
          provide: UserTicketsService,
          useValue: {
            linkTicket: jest.fn(),
            findAllByUser: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserTicketsController>(UserTicketsController);
    service = module.get<UserTicketsService>(UserTicketsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('linkTicket', () => {
    it('should call service.linkTicket with correct args', async () => {
      const dto: LinkUserTicketDto = {
        ticket_code: 'SAFINITY-123',
        event_id: '456',
      };
      const expectedResponse = { message: 'Ticket linked successfully.' };
      jest
        .mocked(service.linkTicket)
        .mockResolvedValue(expectedResponse as any);

      const result = await controller.linkTicket(dto, mockReq);

      expect(result).toEqual(expectedResponse);
      expect(service.linkTicket).toHaveBeenCalledWith(dto, 'user-uuid-123');
    });
  });

  describe('findAll', () => {
    it('should return all user tickets serialized', async () => {
      jest.mocked(service.findAllByUser).mockResolvedValue([]);

      const result = await controller.findAll(mockReq);

      expect(result).toEqual([]);
      expect(service.findAllByUser).toHaveBeenCalledWith('user-uuid-123');
    });
  });

  describe('remove', () => {
    it('should remove a specific ticket via user identification', async () => {
      const expectedResponse = { message: 'Ticket removed successfully.' };
      jest.mocked(service.remove).mockResolvedValue(expectedResponse);

      const result = await controller.remove('99999', mockReq);

      expect(result).toEqual(expectedResponse);
      expect(service.remove).toHaveBeenCalledWith('99999', 'user-uuid-123');
    });
  });
});
