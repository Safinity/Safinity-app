import React from 'react';
import { View } from 'react-native'; // Importação que faltava
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
// Importa o mapeamento que criaste na pasta Events
import { eventImages } from '../assets/images/Events';

const CardContainer = styled.TouchableOpacity`
  width: 280px;
  height: 380px;
  margin-right: ${Spacing.md}px;
  border-radius: ${BorderRadius.large}px;
  overflow: hidden;
`;

const BackgroundImage = styled.ImageBackground.attrs({
  resizeMode: 'cover', // Garante que a imagem preencha o card sem distorcer
})`
  flex: 1;
  width: 100%;
  height: 100%;
`;

const GradientLayer = styled(LinearGradient).attrs({
  colors: ['transparent', 'rgba(0,0,0,0.8)'],
  locations: [0.4, 1.0],
})`
  flex: 1;
  padding: 20px;
  justify-content: space-between;
`;

const TimeBadge = styled.View`
  background-color: rgba(146, 66, 204, 0.5);
  align-self: flex-end;
  padding: 8px 14px;
  border-radius: ${BorderRadius.round}px;
`;

const TimeText = styled.Text`
  color: ${Colors.white};
  font-size: 12px;
  font-weight: 600; /* Aumentado para 600 para ler melhor com a opacidade */
  text-align: center;
`;

const CardFooter = styled.View`
  margin-top: auto;
  margin-bottom: 10px;
`;

const DateText = styled.Text`
  color: ${Colors.white};
  font-size: 14px;
  margin-bottom: 6px;
  font-weight: 400;
  opacity: 0.9;
`;

const TitleText = styled.Text`
  color: ${Colors.white};
  font-size: 22px;
  font-weight: bold;
  line-height: 28px;
`;

export const EventCard = ({ event }: any) => {
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

  return (
    <CardContainer>
      {/* source alterada de {uri: ...} para a variável imageSource */}
      <BackgroundImage source={imageSource}>
        <GradientLayer>
          {event.time_left ? (
            <TimeBadge>
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
