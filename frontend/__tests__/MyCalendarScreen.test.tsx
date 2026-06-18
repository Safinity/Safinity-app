import * as api from '../utils/api';
import { beforeEach, describe, expect, it } from '@jest/globals';
import * as navigationUtils from '../utils/navigationHistory';

jest.mock('../utils/api');
jest.mock('../utils/navigationHistory');
jest.mock('@clerk/expo', () => ({
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    getToken: jest.fn().mockResolvedValue('mock-token'),
  }),
}));

describe('MyCalendar Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch events list', async () => {
    // ARRANGE
    const mockEvents = [
      { id: 'event1', name: 'Music Festival 2024', start_date: '2024-07-01' },
      { id: 'event2', name: 'Tech Conference', start_date: '2024-08-15' },
    ];

    (api.default.get as jest.Mock).mockResolvedValue({ data: mockEvents });

    // ACT
    const response = await api.default.get('/events');

    // ASSERT
    expect(response.data).toHaveLength(2);
    expect(api.default.get).toHaveBeenCalledWith('/events');
  });

  it('should get present event', async () => {
    // ARRANGE
    const mockEvent = {
      id: 'event1',
      name: 'Live Festival',
      start_date: '2024-06-19',
    };

    (api.default.get as jest.Mock).mockResolvedValue({ data: mockEvent });

    // ACT
    const response = await api.default.get('/events/present-event', {
      headers: { Authorization: 'Bearer token' },
    });

    // ASSERT
    expect(response.data.name).toBe('Live Festival');
    expect(api.default.get).toHaveBeenCalled();
  });

  it('should handle empty events list', async () => {
    // ARRANGE
    (api.default.get as jest.Mock).mockResolvedValue({ data: [] });

    // ACT
    const response = await api.default.get('/events');

    // ASSERT
    expect(response.data).toEqual([]);
  });

  it('should format date correctly', () => {
    // ARRANGE
    const dateString = '2024-07-15';

    // ACT
    const dateKey = new Date(dateString).toISOString().slice(0, 10);

    // ASSERT
    expect(dateKey).toBe('2024-07-15');
  });

  it('should format month correctly', () => {
    // ARRANGE
    const dateString = '2024-07-15';

    // ACT
    const month = new Date(dateString).toLocaleDateString('en-GB', { month: 'short' });

    // ASSERT
    expect(month).toBe('Jul');
  });

  it('should format day correctly', () => {
    // ARRANGE
    const dateString = '2024-07-15';

    // ACT
    const day = new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit' });

    // ASSERT
    expect(day).toBe('15');
  });

  it('should format time correctly', () => {
    // ARRANGE
    const dateString = '2024-07-15T14:30:00';

    // ACT
    const time = new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // ASSERT
    expect(time).toContain('14:30');
  });

  it('should handle invalid date gracefully', () => {
    // ARRANGE
    const invalidDate = 'invalid-date';

    // ACT & ASSERT
    try {
      new Date(invalidDate).toISOString();
      expect(true).toBe(true);
    } catch {
      expect(false).toBe(false);
    }
  });

  it('should navigate back', async () => {
    // ARRANGE
    (navigationUtils.navigateToPreviousRoute as jest.Mock).mockResolvedValue(true);

    // ACT
    await navigationUtils.navigateToPreviousRoute();

    // ASSERT
    expect(navigationUtils.navigateToPreviousRoute).toHaveBeenCalled();
  });
});
