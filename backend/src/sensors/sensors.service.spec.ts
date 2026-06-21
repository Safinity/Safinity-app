import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { SensorsService } from './sensors.service';

describe('SensorsService', () => {
  const prisma = {
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  };
  let service: SensorsService;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.SENSOR_WEBHOOK_SECRET;
    service = new SensorsService(prisma as never);
  });

  afterEach(() => {
    service.onModuleDestroy();
    jest.useRealTimers();
  });

  it('starts and clears the simulation timer', () => {
    jest.useFakeTimers();
    prisma.$executeRaw.mockResolvedValue(1);
    service.onModuleInit();
    jest.advanceTimersByTime(10_000);
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
    service.onModuleDestroy();
  });

  it('logs simulation failures without crashing the timer', async () => {
    jest.useFakeTimers();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    prisma.$executeRaw.mockRejectedValue(new Error('database unavailable'));
    service.onModuleInit();
    await jest.advanceTimersByTimeAsync(10_000);
    expect(errorSpy).toHaveBeenCalledWith(
      '[SENSORS] Failed to simulate sensor readings:',
      expect.any(Error),
    );
    errorSpy.mockRestore();
  });

  it('returns active event sensors and serializes bigint ids', async () => {
    prisma.$queryRaw.mockResolvedValue([
      { id: 2n, event_id: 3n, density: 42, lat: 1, lng: 2 },
    ]);
    await expect(service.findByEvent('3')).resolves.toEqual([
      { id: '2', event_id: '3', density: 42, lat: 1, lng: 2 },
    ]);
  });

  it.each(['', 'abc'])('rejects an invalid event id (%s)', async (eventId) => {
    await expect(service.findByEvent(eventId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('updates a sensor using aliases and clamps density', async () => {
    prisma.$queryRaw.mockResolvedValue([
      { id: 4n, event_id: 9n, density: 100, sensor_type: 'counter' },
    ]);
    await expect(
      service.handleWebhook(
        { sensorId: '4', value: 150, sensorType: 'counter' },
        'secret',
      ),
    ).resolves.toEqual({
      message: 'Sensor reading updated',
      sensor: {
        id: '4',
        event_id: '9',
        density: 100,
        sensor_type: 'counter',
      },
    });
  });

  it('uses the default sensor type and clamps negative density', async () => {
    prisma.$queryRaw.mockResolvedValue([{ id: 1n, density: 0 }]);
    await expect(
      service.handleWebhook({ sensor_id: 1, density: -5 }),
    ).resolves.toMatchObject({ sensor: { id: '1', density: 0 } });
  });

  it('validates secret, id, density and missing sensors', async () => {
    process.env.SENSOR_WEBHOOK_SECRET = 'expected';
    await expect(
      service.handleWebhook({ sensor_id: 1, density: 10 }, 'wrong'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    delete process.env.SENSOR_WEBHOOK_SECRET;
    await expect(service.handleWebhook({ density: 10 })).rejects.toThrow(
      'sensor_id is required',
    );
    await expect(
      service.handleWebhook({ sensor_id: 'bad', density: 10 }),
    ).rejects.toThrow('Invalid sensor_id');
    await expect(service.handleWebhook({ sensor_id: 1 })).rejects.toThrow(
      'density value is required',
    );

    prisma.$queryRaw.mockResolvedValue([]);
    await expect(
      service.handleWebhook({ sensor_id: 99, density: 10 }),
    ).rejects.toThrow('not found or event is not active');
  });

  it('runs the crowd-density simulation query', async () => {
    prisma.$executeRaw.mockResolvedValue(2);
    await service.simulateCrowdDensityReadings();
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });
});
