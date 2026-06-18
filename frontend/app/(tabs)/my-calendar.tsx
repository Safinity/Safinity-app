import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import styled from 'styled-components/native';

import { CalendarCard } from '../../components/CalendarCard';
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

function formatActivityDate(value?: string | null) {
  if (!value) return 'Date TBD';

  try {
    return new Date(value).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return 'Invalid date';
  }
}

function formatActivityTime(value?: string | null) {
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
  const source = activity.activity || activity.activities || activity;
  const specifications = source.specifications || {};

  return {
    ...source,
    id: source.id || activity.activity_id || activity.id,
    title: source.title || source.name || 'Untitled activity',
    category: source.category || specifications.category || 'Stages',
    image: source.image || specifications.image || '1.jpg',
    location: source.location || source.points_interest?.name || 'Location TBD',
    date: source.date || formatActivityDate(source.start_time),
    startTime: source.startTime || formatActivityTime(source.start_time),
    endTime: source.endTime || formatActivityTime(source.end_time),
  };
}

export default function MyCalendarScreen() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  const {
    favouriteActivitiesByEvent,
    loadingEventIds,
    updatingActivityIds,
    selectedCalendarEventId,
    setSelectedCalendarEventId,
    loadEventFavourites,
    toggleFavouriteActivity,
  } = useActivityFavourites();

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  getTokenRef.current = getToken;

  const selectedEventId = selectedEvent?.id ? String(selectedEvent.id) : null;
  const favouriteActivities = useMemo(
    () =>
      selectedEventId
        ? (favouriteActivitiesByEvent[selectedEventId] || [])
            .map(normalizeFavouriteActivity)
            .sort((a, b) => {
              const firstTime = a.start_time ? new Date(a.start_time).getTime() : 0;
              const secondTime = b.start_time ? new Date(b.start_time).getTime() : 0;
              return firstTime - secondTime;
            })
        : [],
    [favouriteActivitiesByEvent, selectedEventId],
  );
  const isLoadingFavourites = selectedEventId ? loadingEventIds.has(selectedEventId) : false;

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
        const savedEvent = selectedCalendarEventId
          ? eventsList.find(eventItem => String(eventItem.id) === String(selectedCalendarEventId))
          : null;

        if (savedEvent) {
          event = savedEvent;
        } else {
          try {
            const presentEventResponse = await api.get('/events/present-event', {
              headers: authHeaders(token),
            });
            event = presentEventResponse.data;
          } catch {
            event = eventsList[0] || null;
          }
        }

        if (!isActive) {
          return;
        }

        setEvents(eventsList);
        setSelectedEvent(event);
        setSelectedCalendarEventId(event?.id ? String(event.id) : null);

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
  }, [
    isLoaded,
    isSignedIn,
    loadEventFavourites,
    selectedCalendarEventId,
    setSelectedCalendarEventId,
  ]);

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
    setSelectedCalendarEventId(String(event.id));

    await loadEventFavourites(event.id, true);
  };

  const handleToggleFavorite = async (activity: any, shouldBeFavorite: boolean) => {
    if (!selectedEventId) {
      return;
    }

    try {
      await toggleFavouriteActivity(activity, selectedEventId, shouldBeFavorite);
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
    }
  };

  const emptyMessage = !isSignedIn
    ? 'Sign in to see your favourite activities'
    : 'No favourite activities for this event yet';

  return (
    <Container>
      <Head>
        <title>Favourites activities | Safinity</title>
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

        <Title role="header">Favourites activities</Title>

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
      </ContentWrapper>

      <ScrollView
        showsVerticalScrollIndicator={false}
        role="main"
        accessibilityLabel="Favourite activities list"
      >
        <CardsContainer>
          {loading || isLoadingFavourites ? (
            <EmptyText>Loading favourites...</EmptyText>
          ) : favouriteActivities.length > 0 ? (
            favouriteActivities.map((activity, index) => {
              const activityId = String(activity.id);
              const activityWithFavorite = {
                ...activity,
                isFavorite: true,
              };

              return (
                <View key={activity.id}>
                  {(index === 0 || favouriteActivities[index - 1].date !== activity.date) && (
                    <DateHeader>{activity.date}</DateHeader>
                  )}

                  <View style={{ marginBottom: Spacing.md }}>
                    <CalendarCard
                      item={activityWithFavorite}
                      onToggleFavorite={handleToggleFavorite}
                      isFavoriteUpdating={updatingActivityIds.has(activityId)}
                    />
                  </View>
                </View>
              );
            })
          ) : (
            <EmptyText>{emptyMessage}</EmptyText>
          )}
        </CardsContainer>
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

const CardsContainer = styled.View`
  flex: 1;
  padding: 0 ${Spacing.margemLateral}px;
  padding-bottom: ${Spacing.xxl}px;
`;

const DateHeader = styled.Text`
  color: ${Colors.white};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.textoPequeno.fontSize}px;
  margin-top: ${Spacing.lg}px;
  margin-bottom: ${Spacing.sm}px;
  text-transform: capitalize;
`;

const EmptyText = styled.Text`
  color: ${Colors.white};
  text-align: center;
  margin-top: ${Spacing.xxl}px;
  ${TextStyles.corpo.corpoTexto};
`;
