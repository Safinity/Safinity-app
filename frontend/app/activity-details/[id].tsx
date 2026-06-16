import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/ui/header';
import { HeroBanner } from '../../components/HeroBanner';
import api from '../../utils/api';
import { useActivityFavourites } from '../../context/ActivityFavouritesContext';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ContentCard = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.margemLateral}px;
  padding-top: 0;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.titulo.h3};
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  font-weight: bold;
`;

const DescriptionText = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;

const RouteCard = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;

const RouteIconWrapper = styled.View`
  background-color: rgba(255, 255, 255, 0.1);
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
`;

const RouteInfo = styled.View`
  margin-left: ${({ theme }) => theme.spacing.md}px;
`;

const RouteTitle = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.label};
  font-weight: bold;
`;

const FeaturingSection = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const AvatarStack = styled.View`
  flex-direction: row;
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

const Avatar = styled.Image`
  width: ${({ theme }) => theme.height.tam_42}px;
  height: ${({ theme }) => theme.height.tam_42}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  border-width: ${({ theme }) => theme.spacing.xxs}px;
  border-color: ${({ theme }) => theme.colors.background};
  margin-right: -${({ theme }) => theme.spacing.md}px;
`;

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

function normalizeActivity(activity: any) {
  const specifications = activity.specifications || {};

  return {
    ...activity,
    title: activity.title || activity.name || 'Untitled activity',
    category: activity.category || specifications.category || 'Stages',
    image: activity.image || specifications.image || '1.jpg',
    location: activity.location || activity.points_interest?.name || 'Location TBD',
    date: activity.date || formatActivityDate(activity.start_time),
    startTime: activity.startTime || formatActivityTime(activity.start_time),
    endTime: activity.endTime || formatActivityTime(activity.end_time),
    featuring: activity.featuring || specifications.featuring || [],
  };
}

// --- Screen ---

export default function ActivityDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    favouriteActivityIds,
    updatingActivityIds,
    loadEventFavourites,
    toggleFavouriteActivity,
  } = useActivityFavourites();
  const [activity, setActivity] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadActivity = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/events/activities/${id}`);
        if (!mounted) return;
        setActivity(normalizeActivity(res.data));
      } catch (err: any) {
        console.error('Erro ao carregar activity:', err);
        if (!mounted) return;
        setError('Erro ao carregar detalhes da atividade.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadActivity();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (activity?.event_id) {
      loadEventFavourites(activity.event_id).catch(error => {
        console.error('Erro ao carregar favoritos da atividade:', error);
      });
    }
  }, [activity?.event_id, loadEventFavourites]);

  if (loading) {
    return (
      <Container>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={{ padding: 24 }}>
          <Text style={{ color: 'white' }}>{error}</Text>
        </View>
      </Container>
    );
  }

  if (!activity) return null;

  return (
    <Container>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* MAIN REGION */}
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        role="main"
        accessibilityLabel="Activity details"
      >
        <HeroBanner
          event={activity}
          isDetail
          detailType="activity"
          isFavorite={favouriteActivityIds.has(String(activity.id))}
          isFavoriteUpdating={updatingActivityIds.has(String(activity.id))}
          onToggleFavorite={(activityToToggle: any, shouldBeFavorite: boolean) =>
            toggleFavouriteActivity(activityToToggle, activity.event_id, shouldBeFavorite)
          }
        />

        <ContentCard>
          <SectionTitle accessibilityRole="header">Description</SectionTitle>
          <DescriptionText>{activity.description || 'No description available.'}</DescriptionText>

          <RouteCard
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/map')}
            accessibilityRole="button"
            accessibilityLabel={`View route to ${activity.location}`}
            accessibilityHint="Opens map for this activity"
          >
            <RouteIconWrapper>
              <Ionicons name="location" size={24} color="white" />
            </RouteIconWrapper>

            <RouteInfo>
              <RouteTitle>{activity.location}</RouteTitle>
              <DescriptionText>View route</DescriptionText>
            </RouteInfo>
          </RouteCard>

          <SectionTitle accessibilityRole="header">Featuring</SectionTitle>

          <FeaturingSection>
            {activity.featuring && activity.featuring.length > 0 ? (
              <>
                <AvatarStack>
                  {activity.featuring.slice(0, 3).map((person, index) => (
                    <Avatar
                      key={index}
                      source={{
                        uri: `https://i.pravatar.cc/100?u=${encodeURIComponent(person)}`,
                      }}
                      accessible
                      accessibilityLabel={person}
                    />
                  ))}
                </AvatarStack>

                <DescriptionText style={{ flex: 1 }}>
                  {activity.featuring.join(', ')}
                </DescriptionText>
              </>
            ) : (
              <DescriptionText>To Be Announced</DescriptionText>
            )}
          </FeaturingSection>

          <View style={{ height: 80 }} />
        </ContentCard>
      </ScrollView>

      {/* BACK BUTTON */}
      <Header variant="pageDetails" />
    </Container>
  );
}
