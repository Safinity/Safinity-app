import React, { useState } from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { eventImages } from '../assets/images/Events';
import { calendarImages } from '../assets/images/Calendar';
import { getEventImageSource } from '../utils/eventImages';

const BannerContainer = styled.ImageBackground.attrs({
  resizeMode: 'cover',
})`
  width: 100%;
  height: ${({ theme }) => theme.height.xl}px;
  justify-content: flex-end;
`;

// Gradiente adaptado dinamicamente usando a cor de fundo do tema original
const HeroGradient = styled(LinearGradient).attrs(({ theme, isLiveMode }: any) => ({
  colors: isLiveMode
    ? ['transparent', theme.colors.background] // Removido o esbranquiçado, funde diretamente com a cor da app
    : ['transparent', theme.colors.background],
  start: { x: 0, y: 0.2 },
  end: { x: 0, y: 1 },
}))<{ isLiveMode?: boolean }>`
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

// Novos estilos para o ecrã específico de Evento Ativo
const LiveModeWrapper = styled.View`
  width: 100%;
  align-items: flex-start;
`;

const NowAtText = styled.Text`
  color: ${({ theme }) => theme.colors.white || '#FFFFFF'}; /* Alterado de preto para branco */
  font-family: ${({ theme }) => theme.text.corpo.bold?.fontFamily || 'System'};
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 2px;
`;

const LiveEventName = styled.Text`
  color: ${({ theme }) => theme.colors.primary_50 || '#C9A0E5'}; /* Nome do evento a roxo */
  font-family: ${({ theme }) => theme.text.titulo.h.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h.fontSize}px;
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const CheckedInBadge = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.ligth80 || '#E9D9F5'};
  padding: 6px 12px;
  border-radius: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const CheckedInDot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.primary || '#7A39B8'};
  margin-right: 6px;
`;

const CheckedInText = styled.Text`
  color: ${({ theme }) => theme.colors.backgorund || '#222734'};
  font-family: ${({ theme }) => theme.text.textoPequeno?.fontFamily || 'System'};
  font-size: 12px;
  font-weight: 500;
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
  isFavorite: controlledIsFavorite,
  onToggleFavorite,
  isFavoriteUpdating = false,
  isLiveMode = false,
}: any) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const displayedIsFavorite = controlledIsFavorite ?? isFavorite;

  const getSource = () => {
    if (!event) return null;

    if (calendarImages[event.image]) return calendarImages[event.image];

    return getEventImageSource(event.image, eventImages['banner-lista-eventos']);
  };

  const imageSource = getSource();

  const isCalendar = isDetail && (detailType === 'activity' || (!detailType && event?.title));
  const isEventDetail =
    isDetail && (detailType === 'event' || (!detailType && event?.name && !event?.title));
  const isList = !isDetail && title;

  const isHome = !isDetail && !title && event && !isLiveMode;

  const accessibleLabel = `Banner de destaque do evento: ${event?.name || event?.title || title || 'Evento'}`;

  return (
    <BannerContainer source={imageSource} accessible={false}>
      <HeroGradient
        isLiveMode={isLiveMode}
        accessible={true}
        accessibilityLabel={accessibleLabel}
        accessibilityRole="header"
        aria-label={accessibleLabel}
      >
        {/* NOVO CENÁRIO: Ecrã de Evento Ativo (Live Mode) */}
        {isLiveMode && event && (
          <LiveModeWrapper>
            <NowAtText>Now, at</NowAtText>
            <LiveEventName>{event.name}</LiveEventName>

            <CheckedInBadge>
              <CheckedInDot />
              <CheckedInText>You’re checked in!</CheckedInText>
            </CheckedInBadge>

            {/* O link "View the map" foi removido daqui completamente */}
          </LiveModeWrapper>
        )}

        {isCalendar && (
          <>
            <TitleRow>
              <EventName style={{ flex: 1, marginRight: 15 }} numberOfLines={2}>
                {event.title}
              </EventName>

              <AddCalendarButton
                activeOpacity={0.8}
                onPress={async () => {
                  if (isFavoriteUpdating) return;
                  const nextValue = !displayedIsFavorite;
                  if (controlledIsFavorite === undefined) {
                    setIsFavorite(nextValue);
                  }
                  try {
                    await onToggleFavorite?.(event, nextValue);
                  } catch (error) {
                    if (controlledIsFavorite === undefined) {
                      setIsFavorite(!nextValue);
                    }
                    console.error('Erro ao atualizar favorito:', error);
                  }
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={
                  displayedIsFavorite ? 'Remove from favorites' : 'Add to favorites'
                }
                disabled={isFavoriteUpdating}
              >
                <Ionicons
                  name={displayedIsFavorite ? 'heart' : 'heart-outline'}
                  size={30}
                  color="#9333EA"
                />
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
