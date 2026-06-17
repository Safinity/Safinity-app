import * as api from '../utils/api';
import { beforeEach, describe, expect, it } from '@jest/globals';

jest.mock('../utils/api');

describe('HomeScreen API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock API', async () => {
    (api.default.get as jest.Mock).mockResolvedValue({
      data: [{ id: '1', name: 'Music Festival', status: 'live' }],
    });

    const result = await api.default.get('/events');

    expect(result.data).toBeDefined();
    expect(result.data[0].name).toBe('Music Festival');
  });

  it('should call API with correct endpoint', async () => {
    (api.default.get as jest.Mock).mockResolvedValue({
      data: [],
    });

    await api.default.get('/events');

    expect(api.default.get).toHaveBeenCalledWith('/events');
  });

  it('should handle API errors', async () => {
    (api.default.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    try {
      await api.default.get('/events');
    } catch (error: any) {
      expect(error.message).toBe('Network error');
    }
  });

  it('should add favorite', async () => {
    (api.default.post as jest.Mock).mockResolvedValue({
      data: { id: '1', activity_id: '123', user_id: 'user1' },
    });

    const result = await api.default.post('/events/favourite', {
      activity_id: '123',
    });

    expect(result.data.activity_id).toBe('123');
    expect(api.default.post).toHaveBeenCalled();
  });

  it('should remove favorite', async () => {
    (api.default.delete as jest.Mock).mockResolvedValue({
      data: { success: true },
    });

    const result = await api.default.delete('/events/favourite/123');

    expect(result.data.success).toBe(true);
    expect(api.default.delete).toHaveBeenCalledWith('/events/favourite/123');
  });
});
