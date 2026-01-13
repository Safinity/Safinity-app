import React from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';
import { eventImages } from '../assets/images/Events';

const BannerContainer = styled.ImageBackground.attrs({
  resizeMode: 'cover',
})`
  width: 100%;
  height: 330px;
  justify-content: flex-end;
`;

const HeroGradient = styled(LinearGradient).attrs(({ theme }) => ({
  colors: ['transparent', theme.colors.background],
  start: { x: 0, y: 0.4 },
  end: { x: 0, y: 1 },
}))`
  width: 100%;
  height: 100%;
  padding: 20px 20px 20px 40px;
  justify-content: flex-end;
`;

const EventName = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h.fontSize}px;
`;

// Estilos específicos para a versão de Detalhes
const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 12px;
  gap: 25px;
`;

const InfoItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const InfoText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.textoPequeno.fontFamily};
  font-size: ${({ theme }) => theme.text.textoPequeno.fontSize}px;
  line-height: ${({ theme }) => theme.text.textoPequeno.lineHeight}px;
`;

// Estilos originais mantidos para as outras versões
const DescriptionText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  /* Token: textoPequeno */
  font-family: ${({ theme }) => theme.text.textoPequeno.fontFamily};
  font-size: ${({ theme }) => theme.text.textoPequeno.fontSize}px;
  line-height: ${({ theme }) => theme.text.textoPequeno.lineHeight}px;
  margin-top: 4px;
  opacity: 0.9;
`;

const StatusTag = styled.Text`
  color: ${Colors.white};
  font-size: 24px;
  font-weight: 300;
`;

const ViewMapLink = styled.TouchableOpacity`
  margin-top: ${Spacing.sm}px;
`;

const MapText = styled.Text`
  color: ${Colors.white};
  font-size: 16px;
  text-decoration-line: underline;
  opacity: 0.8;
`;

export const HeroBanner = ({
  event,
  title,
  description,
  hideMap = false,
  isDetail = false,
}: any) => {
  const imageSource = eventImages[event.id] || { uri: event.image };

  // Função interna para formatar a data como "10-12 July 2025"
  const formatDetailDate = (start: string, end: string) => {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);

    const startDay = s.getDate();
    const endDay = e.getDate();
    const month = s.toLocaleString('en-US', { month: 'long' });
    const year = s.getFullYear();

    return `${startDay}-${endDay} ${month} ${year}`;
  };

  return (
    <BannerContainer source={imageSource} imageStyle={{ borderRadius: 0 }}>
      <HeroGradient>
        {isDetail ? (
          /* VERSÃO 3: DETALHES DO EVENTO */
          <>
            <EventName>{event.name}</EventName>
            <InfoRow>
              <InfoItem>
                <Ionicons name="calendar-outline" size={20} color="white" />
                <InfoText>{formatDetailDate(event.start_date, event.end_date)}</InfoText>
              </InfoItem>

              <InfoItem>
                <Ionicons name="time-outline" size={20} color="white" />
                <InfoText>
                  {event.start_time} - {event.end_time}
                </InfoText>
              </InfoItem>
            </InfoRow>
          </>
        ) : (
          /* VERSÕES 1 E 2: HOME E LISTAS */
          <>
            {title ? (
              <>
                <EventName>{title}</EventName>
                {description && <DescriptionText>{description}</DescriptionText>}
              </>
            ) : (
              <EventName>
                {event.name || event.title}, <StatusTag>now</StatusTag>
              </EventName>
            )}

            {!hideMap && (
              <ViewMapLink>
                <MapText>View the map</MapText>
              </ViewMapLink>
            )}
          </>
        )}
      </HeroGradient>
    </BannerContainer>
  );
};
