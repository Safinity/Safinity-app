import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { eventImages } from '../assets/images/Events';
import { useRouter } from 'expo-router'; // Importação do router

const CardContainer = styled.TouchableOpacity<{ isCompact?: boolean }>`
  width: 280px;
  height: ${({ isCompact }) => (isCompact ? '240px' : '380px')};
  margin-right: ${Spacing.md}px;
  border-radius: ${BorderRadius.large}px;
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
    /* Removidas as aspas e px literais dentro da função */
    padding: ${({ isCompact }) => (isCompact ? 15 : 20)}px; 
    justify-content: space-between;
  `;
  
  const TimeBadge = styled.View<{ isCompact?: boolean }>`
    background-color: rgba(146, 66, 204, 0.5);
    align-self: flex-end;
    /* Ajuste aqui também */
    padding: ${({ isCompact }) => (isCompact ? '4px 10px' : '8px 14px')};
    border-radius: ${BorderRadius.round}px;
  `;

const TimeText = styled.Text`
  color: ${Colors.white};
  font-size: 12px;
  font-weight: 600;
  text-align: center;
`;

const CardFooter = styled.View`
  margin-top: auto;
  margin-bottom: 5px;
`;

const DateText = styled.Text<{ isCompact?: boolean }>`
  color: ${Colors.white};
  font-size: ${({ isCompact }) => (isCompact ? '12px' : '14px')};
  margin-bottom: 4px;
  font-weight: 400;
  opacity: 0.9;
`;

const TitleText = styled.Text<{ isCompact?: boolean }>`
  color: ${Colors.white};
  font-size: ${({ isCompact }) => (isCompact ? '18px' : '22px')};
  font-weight: bold;
  line-height: ${({ isCompact }) => (isCompact ? '22px' : '28px')};
`;

export const EventCard = ({ event, variant }: any) => {
  const router = useRouter(); // Inicialização do router
  const isCompact = variant === 'compact';
  const imageSource = eventImages[event.id] || { uri: 'https://via.placeholder.com/300' };

  const formatEventDate = (start: string, end: string) => {
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

  // Função para lidar com o clique e navegar para a rota dinâmica
  const handlePress = () => {
    router.push(`/event-details/${event.id}`);
  };

  return (
    <CardContainer isCompact={isCompact} onPress={handlePress}>
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
            <DateText isCompact={isCompact}>
              {formatEventDate(event.start_date, event.end_date)}
            </DateText>
            <TitleText isCompact={isCompact}>{event.name}</TitleText>
          </CardFooter>
        </GradientLayer>
      </BackgroundImage>
    </CardContainer>
  );
};