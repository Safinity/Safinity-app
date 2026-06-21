import React from 'react';
import styled from 'styled-components/native';
import { Colors, Spacing, BorderRadius, TextStyles } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Importações necessárias para resolver a imagem dinâmica do evento igual à Home
import { getEventImageSource } from '../utils/eventImages';
import { eventImages } from '../assets/images/Events';

// Padrão do código de barras igual ao do Index
const barcodePattern = [
  { width: 1, gap: 0 },
  { width: 1, gap: 0 },
  { width: 3, gap: 2 },
  { width: 1, gap: 0 },
  { width: 4, gap: 1 },
  { width: 2, gap: 3 },
  { width: 1, gap: 0 },
  { width: 3, gap: 0 },
  { width: 1, gap: 4 },
  { width: 4, gap: 0 },
  { width: 2, gap: 1 },
  { width: 1, gap: 0 },
  { width: 3, gap: 2 },
  { width: 1, gap: 0 },
  { width: 2, gap: 3 },
  { width: 4, gap: 1 },
  { width: 1, gap: 0 },
  { width: 3, gap: 0 },
  { width: 1, gap: 2 },
  { width: 4, gap: 0 },
];

const CardContainer = styled.TouchableOpacity`
  width: 100%;
  height: 185px;
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
  colors: ['rgba(0,0,0,0.08)', 'rgba(146,66,204,0.48)', 'rgba(0,0,0,0.82)'],
  locations: [0, 0.5, 1],
})`
  flex: 1;
  padding: ${Spacing.lg}px;
  padding-right: 48px;
  justify-content: space-between;
`;

const TicketTopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

const TicketBarcode = styled.View`
  position: absolute;
  right: -17%;
  top: 50%;
  gap: ${Spacing.xs}px;
  height: 16px;
  transform: rotate(90deg);
  flex-direction: row;
`;

const BarcodeBar = styled.View`
  height: 100%;
  background-color: white;
  opacity: 0.9;
`;

const CardFooter = styled.View``;

const DateText = styled.Text`
  color: ${Colors.white};
  font-family: ${TextStyles.textoPequeno.fontFamily};
  font-size: ${TextStyles.textoPequeno.fontSize}px;
  line-height: ${TextStyles.textoPequeno.lineHeight}px;
  margin-bottom: ${Spacing.xs}px;
`;

const TitleText = styled.Text`
  color: ${Colors.white};
  font-family: ${TextStyles.titulo.h2.fontFamily};
  font-size: ${TextStyles.titulo.h2.fontSize}px;
  line-height: ${TextStyles.titulo.h2.lineHeight}px;
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

  // Resolve a imagem de forma dinâmica com fallback para o banner padrão
  const imageSource = getEventImageSource(event.image, eventImages['banner-lista-eventos']);

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
          <TicketTopRow>
            <Ionicons name="heart" size={16} color={Colors.white} />
          </TicketTopRow>

          <TicketBarcode>
            {barcodePattern.map((bar, index) => (
              <BarcodeBar
                key={`${ticketId || event.id}-${index}`}
                style={{
                  width: bar.width,
                  marginRight: bar.gap,
                }}
              />
            ))}
          </TicketBarcode>

          <CardFooter>
            <DateText>{formatEventDate(event.start_date, event.end_date)}</DateText>
            <TitleText aria-level="3" numberOfLines={2}>
              {event.name || 'Untitled Event'}
            </TitleText>
          </CardFooter>
        </GradientLayer>
      </BackgroundImage>
    </CardContainer>
  );
};
