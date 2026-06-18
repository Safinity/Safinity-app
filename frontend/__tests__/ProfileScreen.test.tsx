import * as profileUtils from '../utils/profile';
import { beforeEach, describe, expect, it } from '@jest/globals';

jest.mock('../utils/profile');

describe('Profile Utils Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get user profile', async () => {
    // ARRANGE
    const mockProfile = {
      id: 'user1',
      name: 'André Dora',
      email: 'andre@example.com',
      username: 'andre123',
      image: null,
      user_tickets: [],
    };

    (profileUtils.getMyProfile as jest.Mock).mockResolvedValue(mockProfile);

    // ACT
    const result = await profileUtils.getMyProfile('token123');

    // ASSERT
    expect(result).toBeDefined();
    expect(result.name).toBe('André Dora');
    expect(profileUtils.getMyProfile).toHaveBeenCalledWith('token123');
  });

  it('should handle profile load error', async () => {
    // ARRANGE
    (profileUtils.getMyProfile as jest.Mock).mockRejectedValue(new Error('Network error'));

    // ACT & ASSERT
    try {
      await profileUtils.getMyProfile('token123');
    } catch (error: any) {
      expect(error.message).toBe('Network error');
    }
  });

  it('should delete account', async () => {
    // ARRANGE
    (profileUtils.deleteMyAccount as jest.Mock).mockResolvedValue({
      success: true,
    });

    // ACT
    const result = await profileUtils.deleteMyAccount('token123');

    // ASSERT
    expect(result.success).toBe(true);
    expect(profileUtils.deleteMyAccount).toHaveBeenCalledWith('token123');
  });

  it('should handle delete account error', async () => {
    // ARRANGE
    (profileUtils.deleteMyAccount as jest.Mock).mockRejectedValue(new Error('Delete failed'));

    // ACT & ASSERT
    try {
      await profileUtils.deleteMyAccount('token123');
    } catch (error: any) {
      expect(error.message).toBe('Delete failed');
    }
  });

  it('should return user profile with tickets', async () => {
    // ARRANGE
    const mockProfile = {
      id: 'user1',
      name: 'Beatriz Castro',
      email: 'beatriz@example.com',
      username: 'beatriz123',
      image: null,
      user_tickets: [
        {
          event: {
            id: 'event1',
            name: 'Music Festival 2024',
          },
        },
      ],
    };

    (profileUtils.getMyProfile as jest.Mock).mockResolvedValue(mockProfile);

    // ACT
    const result = await profileUtils.getMyProfile('token123');

    // ASSERT
    expect(result.user_tickets).toBeDefined();
    expect(result.user_tickets).toHaveLength(1);
    expect(result.user_tickets[0].event.name).toBe('Music Festival 2024');
  });
});
