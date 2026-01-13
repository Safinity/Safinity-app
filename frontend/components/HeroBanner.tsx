import React from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';
import { eventImages } from '../assets/images/Events';

// 1. IMPORTA O MAPEAMENTO DO CALENDÁRIO
import { calendarImages } from '../assets/images/Calendar/index';

const BannerContainer = styled.ImageBackground.attrs({
  resizeMode: 'cover',
})`
  width: 100%;
  height: 330px;
  justify-content: flex-end;
`;

const HeroGradient = styled(LinearGradient).attrs(({ theme }) => ({
  colors: ['transparent', theme.colors.background],
  start: { x: 0, y: 0.2 },
  end: { x: 0, y: 1 },
}))`
  width: 100%;
  height: 100%;
  padding: 20px 25px 20px 40px;
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
  font-family: ${({ theme }) => theme.text.titulo.h.fontFamily};
  font-size: 26px;
  font-weight: bold;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 12px;
`;

const InfoItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-right: 25px;
`;

const InfoText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.textoPequeno.fontFamily};
  font-size: 14px;
  margin-left: 8px;
  font-weight: 300;
`;

const AddCalendarButton = styled.TouchableOpacity`
  background-color: #f3e8ff;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  justify-content: center;
  align-items: center;
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

const DescriptionText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.textoPequeno.fontFamily};
  font-size: 14px;
  margin-top: 4px;
  opacity: 0.9;
`;

export const HeroBanner = ({
  event,
  title,
  description,
  hideMap = false,
  isDetail = false,
}: any) => {
  // 2. LÓGICA DE IMAGEM CORRIGIDA PARA EVITAR 404
  const getSource = () => {
    if (!event) return null;

    // Se for imagem local do calendário (ex: "1.jpg")
    if (calendarImages[event.image]) {
      return calendarImages[event.image];
    }

    // Se for mapeamento de Eventos (ID)
    if (event.id && eventImages[event.id]) {
      return eventImages[event.id];
    }

    // Se for uma URL da web (ex: Unsplash)
    if (typeof event.image === 'string' && event.image.startsWith('http')) {
      return { uri: event.image };
    }

    return null;
  };

  const imageSource = getSource();

  // LOGICA DE DISTINÇÃO (Mantida igual)
  const isCalendar = isDetail && event?.title;
  const isEventDetail = isDetail && event?.name;
  const isList = !isDetail && title;
  const isHome = !isDetail && !title && event;

  return (
    <BannerContainer source={imageSource} imageStyle={{ borderRadius: 0 }}>
      <HeroGradient>
        {/* CASO 1: ATIVIDADE DO CALENDÁRIO */}
        {isCalendar && (
          <>
            <TitleRow>
              <EventName style={{ flex: 1, marginRight: 15 }} numberOfLines={2}>
                {event.title}
              </EventName>
              <AddCalendarButton activeOpacity={0.8}>
                <Ionicons name="calendar-outline" size={26} color="#9333EA" />
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

        {/* CASO 2: DETALHE DE EVENTO */}
        {isEventDetail && (
          <>
            <EventName>{event.name}</EventName>
            <InfoRow>
              <InfoItem>
                <Ionicons name="calendar-outline" size={20} color="white" />
                <InfoText>{event.start_date}</InfoText>
              </InfoItem>
              <InfoItem>
                <Ionicons name="time-outline" size={20} color="white" />
                <InfoText>
                  {event.start_time} - {event.end_time}
                </InfoText>
              </InfoItem>
            </InfoRow>
          </>
        )}

        {/* CASO 3: BANNER DE LISTA */}
        {isList && (
          <>
            <EventName>{title}</EventName>
            {description && <DescriptionText>{description}</DescriptionText>}
          </>
        )}

        {/* CASO 4: BANNER DA HOME */}
        {isHome && (
          <>
            <EventName>
              {event.name}, <StatusTag>now</StatusTag>
            </EventName>
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
