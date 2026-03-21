import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { eventImages } from '../assets/images/Events';
import { useRouter } from 'expo-router';

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
  colors: ['transparent', 'rgba(0,0,0,0.8)'],
  locations: [0.4, 1.0],
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

const TimeText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.label.fontFamily};
  font-size: ${({ theme }) => theme.text.label.fontSize}px;
  line-height: ${({ theme }) => theme.text.label.lineHeight}px;
`;

const CardFooter = styled.View`
  margin-top: auto;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const DateText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.textoPequeno.fontFamily};
  font-size: ${({ theme }) => theme.text.textoPequeno.fontSize}px;
  line-height: ${({ theme }) => theme.text.textoPequeno.lineHeight}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  opacity: 0.9;
`;

const TitleText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h1.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h1.fontSize}px;
  line-height: ${({ theme }) => theme.text.titulo.h1.lineHeight}px;
`;

export const EventCard = ({ event, variant }: any) => {
  const router = useRouter();
  const isCompact = variant === 'compact';
  const imageSource = eventImages[event.id] || { uri: 'https://via.placeholder.com/300' };

  const formatEventDate = (start: string, end: string) => {
    if (!start || !end) return '';
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
  };

  const handlePress = () => {
    router.push(`/event-details/${event.id}`);
  };
// Final substituido para ter alt text 

  const altText = `Cartaz do evento: ${event.name}. Data: ${formatEventDate(event.start_date, event.end_date)}`;

  return (
    <CardContainer 
      isCompact={isCompact} 
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes do evento: ${event.name}`}
      accessibilityHint="Navega para a página de detalhes deste evento"
    >
      <BackgroundImage 
        source={imageSource}
        accessible={false} // Escondemos a imagem de fundo para não duplicar
      >
        <GradientLayer 
          isCompact={isCompact}
          accessible={true}
          accessibilityLabel={altText}
          // @ts-ignore
          aria-label={altText}
        >
          {event.time_left ? (
            <TimeBadge isCompact={isCompact}>
              <TimeText>{event.time_left}</TimeText>
            </TimeBadge>
          ) : (
            <View />
          )}

          <CardFooter>
            <DateText>{formatEventDate(event.start_date, event.end_date)}</DateText>
            <TitleText>{event.name}</TitleText>
          </CardFooter>
        </GradientLayer>
      </BackgroundImage>
    </CardContainer>
  );
};
