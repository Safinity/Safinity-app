import React from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/ui/header';
import { HeroBanner } from '../../components/HeroBanner';
import calendarData from '../../data/calendar.json';

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

// --- Screen ---

export default function ActivityDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const activity = calendarData.activities.find(item => item.id === id);

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
        <HeroBanner event={activity} isDetail />

        <ContentCard>
          <SectionTitle role="header">Description</SectionTitle>
          <DescriptionText>{activity.description || 'No description available.'}</DescriptionText>

          <RouteCard
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/map')}
            role="button"
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

          <SectionTitle role="header">Featuring</SectionTitle>

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
