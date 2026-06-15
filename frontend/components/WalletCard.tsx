import React from 'react';
import styled from 'styled-components/native';
import { Colors, Spacing, BorderRadius, TextStyles } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const CardContainer = styled.TouchableOpacity`
  width: 100%;
  height: 205px;
  border-radius: ${BorderRadius.large}px;
  overflow: hidden;
  margin-bottom: ${Spacing.md}px;
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
})`
  flex: 1;
  padding: ${Spacing.md}px;
  justify-content: flex-end;
`;

const CardFooter = styled.View`
  margin-top: auto;
`;

const DateText = styled.Text`
  color: ${Colors.white};
  font-family: ${TextStyles.textoPequeno.fontFamily};
  font-size: ${TextStyles.textoPequeno.fontSize}px;
  line-height: ${TextStyles.textoPequeno.lineHeight}px;
  margin-bottom: ${Spacing.xs}px;
  opacity: 0.9;
`;

const TitleText = styled.Text`
  color: ${Colors.white};
  font-family: ${TextStyles.titulo.h1.fontFamily};
  font-size: ${TextStyles.titulo.h1.fontSize}px;
  line-height: ${TextStyles.titulo.h1.lineHeight}px;
`;

interface WalletCardProps {
  event: {
    id: string;
    name: string | null;
    image?: string | null;
    start_date: string | null;
    end_date: string | null;
    [key: string]: any;
  };
  ticketId?: string;
}

export const WalletCard = ({ event, ticketId }: WalletCardProps) => {
  const router = useRouter();

  const imageSource = require('../assets/images/bg-card-wallet.png');

  const handlePress = () => {
    router.push({
      pathname: '/(tabs)/perfil/ticket',
      params: { eventId: event.id, ticketId },
    });
  };

  const formatEventDate = (start: string | null, end: string | null) => {
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
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <CardContainer
      onPress={handlePress}
      accessibilityRole="button"
      accessible={true}
      accessibilityLabel={`Evento: ${event.name || 'Untitled Event'}. Data: ${formatEventDate(event.start_date, event.end_date)}`}
    >
      <BackgroundImage source={imageSource}>
        <GradientLayer>
          <CardFooter>
            <DateText>{formatEventDate(event.start_date, event.end_date)}</DateText>
            <TitleText aria-level="3">{event.name || 'Untitled Event'}</TitleText>
          </CardFooter>
        </GradientLayer>
      </BackgroundImage>
    </CardContainer>
  );
};
