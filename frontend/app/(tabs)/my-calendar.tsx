import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import styled from 'styled-components/native';

import { CalendarCard } from '../../components/CalendarCard';
import { useActivityFavourites } from '../../context/ActivityFavouritesContext';
import { Colors, Spacing, TextStyles } from '../../constants/theme';
import { navigateToPreviousRoute } from '../../utils/navigationHistory';
import api from '../../utils/api';
import { useEventMode } from '../../context/EventModeContext';

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
  const { activeEvent } = useEventMode();
  const getTokenRef = useRef(getToken);
  const {
    favouriteActivitiesByEvent,
    loadingEventIds,
    updatingActivityIds,
    setSelectedCalendarEventId,
    loadEventFavourites,
    toggleFavouriteActivity,
  } = useActivityFavourites();

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        setSelectedEvent(null);
        setLoading(false);
        return;
      }

      try {
        const token = await getTokenRef.current();
        let event = activeEvent?.id ? activeEvent : null;

        if (!event) {
          try {
            const presentEventResponse = await api.get('/events/present-event', {
              headers: authHeaders(token),
            });
            event = presentEventResponse.data;
          } catch {
            const eventsResponse = await api.get('/events', {
              params: { pageSize: 100, sortBy: 'start_date', sortOrder: 'asc' },
            });
            const eventsList = getEventsList(eventsResponse.data);
            event = eventsList[0] || null;
          }
        }

        if (!isActive) {
          return;
        }

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
    activeEvent,
    isLoaded,
    isSignedIn,
    loadEventFavourites,
    setSelectedCalendarEventId,
  ]);

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
