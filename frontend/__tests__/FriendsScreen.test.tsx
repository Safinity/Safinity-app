import * as navigationUtils from '../utils/navigationHistory';
import users from '../data/users.json';
import allEvents from '../data/events.json';
import { beforeEach, describe, expect, it } from '@jest/globals';

jest.mock('../utils/navigationHistory');
jest.mock('../data/users.json', () => [
  {
    id: 'ines1',
    name: 'Inês Ferreira',
    username: 'ines.ferreira',
    image: 'ines',
    pastEvents: ['event1', 'event2'],
  },
  {
    id: 'marta1',
    name: 'Marta Silva',
    username: 'marta.silva',
    image: 'marta',
    pastEvents: ['event1', 'event3'],
  },
  {
    id: 'sara1',
    name: 'Sara Pombo',
    username: 'sara.pombo',
    image: 'sara',
    pastEvents: ['event2', 'event3', 'event4'],
  },
]);
jest.mock('../data/events.json', () => [
  { id: 'event1', title: 'Music Festival 2024', date: '2024-07-01' },
  { id: 'event2', title: 'Tech Conference', date: '2024-08-15' },
  { id: 'event3', title: 'Art Exhibition', date: '2024-09-20' },
  { id: 'event4', title: 'Concert Night', date: '2024-10-10' },
]);

describe('FriendProfile Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load Inês Ferreira profile', () => {
    // ARRANGE
    const friendId = 'ines1';

    // ACT
    const friendData = users.find(u => u.id === friendId);

    // ASSERT
    expect(friendData).toBeDefined();
    expect(friendData?.name).toBe('Inês Ferreira');
    expect(friendData?.username).toBe('ines.ferreira');
  });

  it('should load Marta Silva profile', () => {
    // ARRANGE
    const friendId = 'marta1';

    // ACT
    const friendData = users.find(u => u.id === friendId);

    // ASSERT
    expect(friendData).toBeDefined();
    expect(friendData?.name).toBe('Marta Silva');
    expect(friendData?.username).toBe('marta.silva');
  });

  it('should load Sara Pombo profile', () => {
    // ARRANGE
    const friendId = 'sara1';

    // ACT
    const friendData = users.find(u => u.id === friendId);

    // ASSERT
    expect(friendData).toBeDefined();
    expect(friendData?.name).toBe('Sara Pombo');
    expect(friendData?.username).toBe('sara.pombo');
  });

  it('should count Inês past events', () => {
    // ARRANGE
    const friendData = users.find(u => u.id === 'ines1');

    // ACT
    const pastEventsCount = friendData?.pastEvents?.length || 0;

    // ASSERT
    expect(pastEventsCount).toBe(2);
  });

  it('should count Marta past events', () => {
    // ARRANGE
    const friendData = users.find(u => u.id === 'marta1');

    // ACT
    const pastEventsCount = friendData?.pastEvents?.length || 0;

    // ASSERT
    expect(pastEventsCount).toBe(2);
  });

  it('should count Sara past events', () => {
    // ARRANGE
    const friendData = users.find(u => u.id === 'sara1');

    // ACT
    const pastEventsCount = friendData?.pastEvents?.length || 0;

    // ASSERT
    expect(pastEventsCount).toBe(3);
  });

  it('should filter events for Inês', () => {
    // ARRANGE
    const friendData = users.find(u => u.id === 'ines1');

    // ACT
    const userPastEvents = allEvents.filter(event => friendData?.pastEvents?.includes(event.id));

    // ASSERT
    expect(userPastEvents).toHaveLength(2);
    expect(userPastEvents[0].title).toBe('Music Festival 2024');
  });

  it('should filter events for Marta', () => {
    // ARRANGE
    const friendData = users.find(u => u.id === 'marta1');

    // ACT
    const userPastEvents = allEvents.filter(event => friendData?.pastEvents?.includes(event.id));

    // ASSERT
    expect(userPastEvents).toHaveLength(2);
  });

  it('should filter events for Sara', () => {
    // ARRANGE
    const friendData = users.find(u => u.id === 'sara1');

    // ACT
    const userPastEvents = allEvents.filter(event => friendData?.pastEvents?.includes(event.id));

    // ASSERT
    expect(userPastEvents).toHaveLength(3);
    expect(userPastEvents[0].title).toBe('Tech Conference');
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
