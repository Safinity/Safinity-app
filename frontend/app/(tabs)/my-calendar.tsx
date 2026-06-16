import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import styled from 'styled-components/native';

import { useActivityFavourites } from '../../context/ActivityFavouritesContext';
import { BorderRadius, Colors, Fonts, Height, Spacing, TextStyles } from '../../constants/theme';
import { navigateToPreviousRoute } from '../../utils/navigationHistory';
import api from '../../utils/api';

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function getEventsList(data: any) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getDateKey(value?: string | null) {
  if (!value) return 'date-tbd';

  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return 'date-tbd';
  }
}

function formatMonth(value?: string | null) {
  if (!value) return 'TBD';

  try {
    return new Date(value).toLocaleDateString('en-GB', { month: 'short' });
  } catch {
    return 'TBD';
  }
}

function formatDay(value?: string | null) {
  if (!value) return '--';

  try {
    return new Date(value).toLocaleDateString('en-GB', { day: '2-digit' });
  } catch {
    return '--';
  }
}

function formatTime(value?: string | null) {
  if (!value) return '--:--';

  try {
    return new Date(value).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
}

function normalizeFavouriteActivity(activity: any) {
  const specifications = activity.specifications || {};

  return {
    ...activity,
    title: activity.title || activity.name || 'Untitled activity',
    location: activity.location || activity.points_interest?.name || 'Location TBD',
    startTime: activity.startTime || formatTime(activity.start_time),
    endTime: activity.endTime || formatTime(activity.end_time),
    dateKey: activity.dateKey || getDateKey(activity.start_time),
    month: activity.month || formatMonth(activity.start_time),
    day: activity.day || formatDay(activity.start_time),
    category: activity.category || specifications.category || 'Activity',
  };
}

export default function MyCalendarScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  const {
    favouriteActivitiesByEvent,
    loadingEventIds,
    loadEventFavourites,
    toggleFavouriteActivity,
  } = useActivityFavourites();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  getTokenRef.current = getToken;

  const selectedEventId = selectedEvent?.id ? String(selectedEvent.id) : null;
  const favouriteActivities = useMemo(
    () =>
      selectedEventId
        ? (favouriteActivitiesByEvent[selectedEventId] || []).map(normalizeFavouriteActivity)
        : [],
    [favouriteActivitiesByEvent, selectedEventId],
  );
  const dates = useMemo(() => {
    const uniqueDates = new Map<string, { key: string; month: string; day: string }>();

    favouriteActivities.forEach(activity => {
      if (!uniqueDates.has(activity.dateKey)) {
        uniqueDates.set(activity.dateKey, {
          key: activity.dateKey,
          month: activity.month,
          day: activity.day,
        });
      }
    });

    return Array.from(uniqueDates.values());
  }, [favouriteActivities]);
  const filteredActivities = selectedDate
    ? favouriteActivities.filter(activity => activity.dateKey === selectedDate)
    : favouriteActivities;
  const isLoadingFavourites = selectedEventId ? loadingEventIds.has(selectedEventId) : false;

  useEffect(() => {
    if (!selectedDate && dates.length > 0) {
      setSelectedDate(dates[0].key);
      return;
    }

    if (selectedDate && dates.length > 0 && !dates.some(date => date.key === selectedDate)) {
      setSelectedDate(dates[0].key);
      return;
    }

    if (dates.length === 0) {
      setSelectedDate(null);
    }
  }, [dates, selectedDate]);

  useEffect(() => {
    let isActive = true;

    const loadInitialData = async () => {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        setEvents([]);
        setSelectedEvent(null);
        setLoading(false);
        return;
      }

      try {
        const token = await getTokenRef.current();
        let event = null;

        const eventsResponse = await api.get('/events', {
          params: { pageSize: 100, sortBy: 'start_date', sortOrder: 'asc' },
        });
        const eventsList = getEventsList(eventsResponse.data);

        try {
          const presentEventResponse = await api.get('/events/present-event', {
            headers: authHeaders(token),
          });
          event = presentEventResponse.data;
        } catch {
          event = eventsList[0] || null;
        }

        if (!isActive) {
          return;
        }

        setEvents(eventsList);
        setSelectedEvent(event);

        if (event?.id) {
          await loadEventFavourites(event.id, true);
        }
      } catch (error) {
        console.error('Erro ao carregar My Calendar:', error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isActive = false;
    };
  }, [isLoaded, isSignedIn, loadEventFavourites]);

  const handleToggleDropdown = () => {
    if (events.length === 0 || loading) {
      return;
    }

    setIsEventDropdownOpen(prev => !prev);
  };

  const handleSelectEvent = async (event: any) => {
    setIsEventDropdownOpen(false);

    if (!event?.id || event.id === selectedEvent?.id) {
      return;
    }

    setSelectedEvent(event);
    setSelectedDate(null);

    await loadEventFavourites(event.id, true);
  };

  const handleRemoveFavourite = async (activity: any) => {
    if (!selectedEventId) {
      return;
    }

    try {
      await toggleFavouriteActivity(activity, selectedEventId, false);
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };

  const emptyMessage = !isSignedIn
    ? 'Sign in to see your favourite activities'
    : 'No favourite activities for this event yet';

  return (
    <Container>
      <Head>
        <title>My Calendar | Safinity</title>
      </Head>

      <ContentWrapper role="banner">
        <BackButton
          onPress={() => navigateToPreviousRoute()}
          accessible
          role="button"
          accessibilityLabel="Go back to calendar"
        >
          <Ionicons name="arrow-back" size={26} color="white" />
        </BackButton>

        <Title role="header">My calendar</Title>

        <DropdownWrapper>
          <DropdownContainer
            onPress={handleToggleDropdown}
            activeOpacity={0.75}
            accessible
            role="button"
            accessibilityLabel="Event selection"
            accessibilityState={{ expanded: isEventDropdownOpen }}
          >
            <DropdownText numberOfLines={1}>{selectedEvent?.name || 'Select event'}</DropdownText>
            <Ionicons
              name={isEventDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={22}
              color="black"
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </DropdownContainer>

          {isEventDropdownOpen && (
            <DropdownMenu>
              <DropdownScroll nestedScrollEnabled showsVerticalScrollIndicator={events.length > 4}>
                {events.map(event => {
                  const isSelected = event.id === selectedEvent?.id;

                  return (
                    <DropdownOption
                      key={event.id}
                      onPress={() => handleSelectEvent(event)}
                      activeOpacity={0.75}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${event.name}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <DropdownOptionText numberOfLines={1} selected={isSelected}>
                        {event.name}
                      </DropdownOptionText>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={Colors.palette.primary.dark50}
                        />
                      )}
                    </DropdownOption>
                  );
                })}
              </DropdownScroll>
            </DropdownMenu>
          )}
        </DropdownWrapper>

        {dates.length > 0 && (
          <DateSelector role="group" accessibilityLabel="Select date">
            {dates.map(item => (
              <DateItem
                key={item.key}
                onPress={() => setSelectedDate(item.key)}
                accessible
                role="button"
                accessibilityLabel={`Select date ${item.day} ${item.month}`}
              >
                <DateMonth>{item.month}</DateMonth>
                <DateCircle active={selectedDate === item.key}>
                  <DateDay active={selectedDate === item.key}>{item.day}</DateDay>
                </DateCircle>
              </DateItem>
            ))}
          </DateSelector>
        )}
      </ContentWrapper>

      <ScrollView
        showsVerticalScrollIndicator={false}
        role="main"
        accessibilityLabel="My events timeline"
      >
        <TimelineContainer>
          {loading || isLoadingFavourites ? (
            <EmptyText>Loading favourites...</EmptyText>
          ) : filteredActivities.length > 0 ? (
            filteredActivities.map(activity => (
              <TimeRow key={activity.id}>
                <View>
                  <TimeLabel>{activity.startTime}</TimeLabel>
                  <TimeLabel style={{ marginTop: Spacing.xl, opacity: 1 }}>
                    {activity.endTime}
                  </TimeLabel>
                </View>

                <TimelineContent>
                  <GridLine />
                  <EventCard
                    activeOpacity={0.85}
                    onPress={() => router.push(`/activity-details/${activity.id}`)}
                    accessible
                    role="button"
                    accessibilityLabel={`${activity.title}, Location: ${activity.location}, from ${activity.startTime} to ${activity.endTime}`}
                  >
                    <RemoveButton
                      onPress={() => handleRemoveFavourite(activity)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${activity.title} from favourites`}
                    >
                      <Ionicons name="heart" size={18} color={Colors.palette.primary.dark50} />
                    </RemoveButton>
                    <EventTitle>{activity.title}</EventTitle>
                    <LocationRow>
                      <Ionicons
                        name="location"
                        size={14}
                        color={Colors.palette.primary.dark50}
                        accessibilityElementsHidden
                        importantForAccessibility="no"
                      />
                      <LocationText numberOfLines={1}>{activity.location}</LocationText>
                    </LocationRow>
                  </EventCard>
                </TimelineContent>
              </TimeRow>
            ))
          ) : (
            <EmptyText>{emptyMessage}</EmptyText>
          )}

          <TimeRow>
            <TimeLabel>21:00</TimeLabel>
            <TimelineContent>
              <GridLine />
            </TimelineContent>
          </TimeRow>
        </TimelineContainer>
      </ScrollView>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
  padding-top: ${Spacing.margemTop}px;
`;

const ContentWrapper = styled.View`
  padding: 0 ${Spacing.margemLateral}px;
`;

const BackButton = styled.TouchableOpacity`
  margin-bottom: ${Spacing.md}px;
`;

const Title = styled.Text`
  color: ${Colors.white};
  ${TextStyles.titulo.h};
  font-weight: bold;
  margin-bottom: ${Spacing.lg}px;
`;

const DropdownWrapper = styled.View`
  margin-bottom: ${Spacing.xl}px;
  position: relative;
  z-index: 10;
  elevation: 10;
`;

const DropdownContainer = styled.TouchableOpacity`
  background-color: ${Colors.white};
  border-radius: ${BorderRadius.medium}px;
  padding: ${Spacing.sm}px ${Spacing.md}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: ${Height.sm}px;
`;

const DropdownText = styled.Text`
  color: ${Colors.background};
  font-size: ${Fonts.sizes.base}px;
  font-family: ${Fonts.weights.semibold};
  flex: 1;
  margin-right: ${Spacing.sm}px;
`;

const DropdownMenu = styled.View`
  background-color: ${Colors.white};
  border-radius: ${BorderRadius.medium}px;
  position: absolute;
  top: ${Height.sm + Spacing.xs}px;
  left: 0;
  right: 0;
  overflow: hidden;
  z-index: 20;
  elevation: 20;
`;

const DropdownScroll = styled.ScrollView`
  max-height: 220px;
`;

const DropdownOption = styled.TouchableOpacity`
  min-height: ${Height.tam_42}px;
  padding: ${Spacing.sm}px ${Spacing.md}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: rgba(0, 0, 0, 0.08);
`;

const DropdownOptionText = styled.Text<{ selected?: boolean }>`
  color: ${({ selected }: { selected?: boolean }) =>
    selected ? Colors.palette.primary.dark50 : Colors.background};
  font-size: ${Fonts.sizes.base}px;
  font-family: ${Fonts.weights.semibold};
  flex: 1;
  margin-right: ${Spacing.sm}px;
`;

const DateSelector = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${Spacing.xxl}px;
`;

const DateItem = styled.TouchableOpacity`
  align-items: center;
`;

const DateMonth = styled.Text`
  color: ${Colors.white};
  font-size: ${Fonts.sizes.base}px;
  margin-bottom: ${Spacing.xs}px;
  opacity: 1;
`;

const DateCircle = styled.View<{ active?: boolean }>`
  width: ${Height.tam_42}px;
  height: ${Height.tam_42}px;
  border-radius: ${Height.tam_42 / 2}px;
  background-color: ${({ active }: { active?: boolean }) =>
    active ? Colors.white : 'rgba(255,255,255,0)'};
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const DateDay = styled.Text<{ active?: boolean }>`
  color: ${({ active }: { active?: boolean }) => (active ? Colors.background : Colors.white)};
  font-size: ${Fonts.sizes.base}px;
  ${TextStyles.textoPequeno};
`;

const TimelineContainer = styled.View`
  flex: 1;
  padding: 0 ${Spacing.margemLateral}px;
`;

const TimeRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: ${Spacing.sm}px;
  min-height: ${Height.md}px;
`;

const TimeLabel = styled.Text`
  color: ${Colors.white};
  width: ${Height.tam_42}px;
  ${TextStyles.label};
  opacity: 1;
`;

const TimelineContent = styled.View`
  flex: 1;
  position: relative;
`;

const GridLine = styled.View`
  position: absolute;
  top: ${Spacing.xs}px;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
`;

const EventCard = styled.TouchableOpacity`
  background-color: ${Colors.palette.primary.light80};
  border-radius: ${BorderRadius.large}px;
  padding: ${Spacing.md}px;
  margin-top: ${Spacing.sm}px;
  min-height: ${Height.sm}px;
  justify-content: center;
  align-items: center;
`;

const EventTitle = styled.Text`
  color: ${Colors.background};
  text-align: center;
  margin-bottom: ${Spacing.xs}px;
  padding-horizontal: ${Spacing.lg}px;
  ${TextStyles.cardsCalendar};
`;

const LocationRow = styled.View`
  flex-direction: row;
  align-items: center;
  max-width: 100%;
`;

const LocationText = styled.Text`
  color: ${Colors.background};
  font-size: ${Fonts.sizes.xs}px;
  margin-left: ${Spacing.xxs}px;
  max-width: 86%;
`;

const RemoveButton = styled.TouchableOpacity`
  position: absolute;
  top: ${Spacing.sm}px;
  right: ${Spacing.sm}px;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
`;

const EmptyText = styled.Text`
  color: ${Colors.white};
  text-align: center;
  margin-top: ${Spacing.xxl}px;
  ${TextStyles.corpo.corpoTexto};
`;
