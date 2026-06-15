import React, { useState } from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { eventImages } from '../assets/images/Events';
import { calendarImages } from '../assets/images/Calendar';

const BannerContainer = styled.ImageBackground.attrs({
  resizeMode: 'cover',
})`
  width: 100%;
  height: ${({ theme }) => theme.height.xl}px;
  justify-content: flex-end;
`;

const HeroGradient = styled(LinearGradient).attrs(({ theme }) => ({
  colors: ['transparent', theme.colors.background],
  start: { x: 0, y: 0.2 },
  end: { x: 0, y: 1 },
}))`
  width: 100%;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.margemLateral}px;
  justify-content: flex-end;
`;

const TitleRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
`;

const EventName = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.titulo.h};
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const InfoItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing.lg}px;
`;

const InfoText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  margin-left: ${({ theme }) => theme.spacing.sm}px;
  ${({ theme }) => theme.text.textoPequeno};
  opacity: 0.9;
`;

const AddCalendarButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.palette.primary.light90};
  width: ${({ theme }) => theme.height.sm}px;
  height: ${({ theme }) => theme.height.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  justify-content: center;
  align-items: center;
`;

const StatusTag = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.textoPequeno};
  opacity: 0.8;
`;

const ViewMapLink = styled.TouchableOpacity`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const MapText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.corpo.corpoTexto};
  text-decoration-line: underline;
  opacity: 0.8;
`;

const DescriptionText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  ${({ theme }) => theme.text.textoPequeno};
  opacity: 0.9;
`;

export const HeroBanner = ({
  event,
  title,
  description,
  hideMap = false,
  isDetail = false,
  detailType,
}: any) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  // ⭐ MAPA ID → SLUG (igual ao EventCard)
  const eventIdToSlug: Record<string, string> = {
    '1': 'music-festival',
    '2': 'meo-mares-vivas-2025',
    '3': 'superbock-superrock-2025',
    '4': 'meo-sudoeste-2025',
  };

  const getSource = () => {
    if (!event) return null;

    // Se for calendário (usa calendarImages)
    if (calendarImages[event.image]) return calendarImages[event.image];

    // ⭐ Se for evento → usar slug
    const slug = eventIdToSlug[String(event.id)];
    if (slug && eventImages[slug]) return eventImages[slug];

    // Se vier URL externa (não é o caso, mas mantemos)
    if (typeof event.image === 'string' && event.image.startsWith('http')) {
      return { uri: event.image };
    }

    // fallback
    return eventImages['banner-lista-eventos'];
  };

  const imageSource = getSource();

  const isCalendar = isDetail && (detailType === 'activity' || (!detailType && event?.title));
  const isEventDetail =
    isDetail && (detailType === 'event' || (!detailType && event?.name && !event?.title));
  const isList = !isDetail && title;
  const isHome = !isDetail && !title && event;

  const accessibleLabel = `Banner de destaque do evento: ${event?.name || event?.title || title || 'Evento'}`;

  return (
    <BannerContainer source={imageSource} accessible={false}>
      <HeroGradient
        accessible={true}
        accessibilityLabel={accessibleLabel}
        accessibilityRole="header"
        aria-label={accessibleLabel}
      >
        {isCalendar && (
          <>
            <TitleRow>
              <EventName style={{ flex: 1, marginRight: 15 }} numberOfLines={2}>
                {event.title}
              </EventName>

              <AddCalendarButton
                activeOpacity={0.8}
                onPress={() => setIsFavorite(prev => !prev)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={30} color="#9333EA" />
              </AddCalendarButton>
            </TitleRow>

            <InfoRow>
              <InfoItem>
                <Ionicons name="time-outline" size={18} color="white" />
                <InfoText>
                  {event.date}, {event.startTime} - {event.endTime}
                </InfoText>
              </InfoItem>

              <InfoItem>
                <Ionicons name="location-outline" size={18} color="white" />
                <InfoText>{event.location}</InfoText>
              </InfoItem>
            </InfoRow>
          </>
        )}

        {isEventDetail && (
          <>
            <EventName>{event.name}</EventName>

            <InfoRow>
              <InfoItem>
                <Ionicons name="calendar-outline" size={20} color="white" />
                <InfoText>{event.displayDate || event.start_date}</InfoText>
              </InfoItem>

              <InfoItem>
                <Ionicons name="time-outline" size={20} color="white" />
                <InfoText>{event.displayTime || 'Time TBD'}</InfoText>
              </InfoItem>
            </InfoRow>
          </>
        )}

        {isList && (
          <>
            <EventName>{title}</EventName>
            {description && <DescriptionText>{description}</DescriptionText>}
          </>
        )}

        {isHome && (
          <>
            <EventName>
              {event.name}, <StatusTag>now</StatusTag>
            </EventName>

            {!hideMap && (
              <ViewMapLink onPress={() => router.push('/(tabs)/map')}>
                <MapText>View the map</MapText>
              </ViewMapLink>
            )}
          </>
        )}
      </HeroGradient>
    </BannerContainer>
  );
};
