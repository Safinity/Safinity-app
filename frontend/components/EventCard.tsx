import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { eventImages } from '../assets/images/Events';
import { useRouter } from 'expo-router';
import { getEventImageSource } from '../utils/eventImages';

const CardContainer = styled.TouchableOpacity<{ isCompact?: boolean }>`
  width: ${({ theme }) => theme.height.lg}px;
  height: ${({ isCompact, theme }) =>
    isCompact ? theme.height.card.compact : theme.height.card.default}px;
  margin-right: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  overflow: hidden;
`;

const BackgroundImage = styled.ImageBackground.attrs({
  resizeMode: 'cover',
})`
  flex: 1;
  width: 100%;
  height: 100%;
`;

const GradientLayer = styled(LinearGradient).attrs({
  colors: ['transparent', 'rgba(0,0,0,0.85)'], // Garante bom contraste em qualquer modo
  locations: [0.3, 1.0],
})<{ isCompact?: boolean }>`
  flex: 1;
  padding: ${({ isCompact, theme }) =>
    isCompact ? `${theme.spacing.sm}px` : `${theme.spacing.md}px`};
  justify-content: space-between;
`;

const TimeBadge = styled.View<{ isCompact?: boolean }>`
  background-color: ${({ theme }) => theme.colors.primary}80;
  align-self: flex-end;
  padding: ${({ isCompact, theme }) =>
    isCompact
      ? `${theme.spacing.xs}px ${theme.spacing.md}px`
      : `${theme.spacing.sm}px ${theme.spacing.lg}px`};
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
`;

// CORREÇÃO: Removidas as aspas de "white" para aplicar CSS nativo puro
const TimeText = styled.Text`
  color: white; 
  font-family: ${({ theme }) => theme.text.label.fontFamily};
  font-size: ${({ theme }) => theme.text.label.fontSize}px;
  line-height: ${({ theme }) => theme.text.label.lineHeight}px;
`;

const CardFooter = styled.View`
  margin-top: auto;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

// CORREÇÃO: Alterado de theme.colors.white (que muda no light) para a cor estática #FFFFFF
const DateText = styled.Text`
  color: #FFFFFF; 
  font-family: ${({ theme }) => theme.text.textoPequeno.fontFamily};
  font-size: ${({ theme }) => theme.text.textoPequeno.fontSize}px;
  line-height: ${({ theme }) => theme.text.textoPequeno.lineHeight}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  opacity: 0.85;
`;

// CORREÇÃO: Removidas as aspas de "white" para aplicar CSS nativo puro
const TitleText = styled.Text`
  color: white; 
  font-family: ${({ theme }) => theme.text.titulo.h1.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h1.fontSize}px;
  line-height: ${({ theme }) => theme.text.titulo.h1.lineHeight}px;
`;

export const EventCard = ({ event, variant }: any) => {
  const router = useRouter();
  const isCompact = variant === 'compact';
  const imageSource = getEventImageSource(event?.image, eventImages['banner-lista-eventos']);

  const handlePress = () => {
    router.push(`/event-details/${event.id}`);
  };

  const formatEventDate = (start: string, end: string) => {
    if (!start || !end) return 'Date TBD';
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const startDay = startDate.getDate();
      const endDay = endDate.getDate();
      const month = startDate.toLocaleString('en-GB', { month: 'long' });
      const year = startDate.getFullYear();

      if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDay}-${endDay} ${month} ${year}`;
      }
      return `${startDay} ${startDate.toLocaleString('en-GB', { month: 'short' })} - ${endDay} ${endDate.toLocaleString('en-GB', { month: 'short' })} ${year}`;
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <CardContainer
      isCompact={isCompact}
      onPress={handlePress}
      href={`/event-details/${event.id}`}
      accessibilityRole="button"
      accessible={true}
      accessibilityLabel={`Evento: ${event.name}. Data: ${formatEventDate(event.start_date, event.end_date)}`}
    >
      <BackgroundImage source={imageSource}>
        <GradientLayer isCompact={isCompact}>
          {event.time_left ? (
            <TimeBadge isCompact={isCompact}>
              <TimeText>{event.time_left}</TimeText>
            </TimeBadge>
          ) : (
            <View />
          )}

          <CardFooter>
            <DateText>{formatEventDate(event.start_date, event.end_date)}</DateText>
            <TitleText aria-level="3">{event.name || 'Untitled Event'}</TitleText>
          </CardFooter>
        </GradientLayer>
      </BackgroundImage>
    </CardContainer>
  );
};