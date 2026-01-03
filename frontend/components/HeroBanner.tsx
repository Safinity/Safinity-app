import React from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing } from '../constants/theme';
import { eventImages } from '../assets/images/Events';

const BannerContainer = styled.ImageBackground.attrs({
  resizeMode: 'cover',
})`
  width: 100%;
  height: 330px;
  justify-content: flex-end;
`;

// Configuração do Gradiente: Transparente no topo/meio, cor de fundo na base
const HeroGradient = styled(LinearGradient).attrs(({ theme }) => ({
  colors: ['transparent', theme.colors.background],
  // Começa a transição no meio (0.5) e termina no fundo (1.0)
  start: { x: 0, y: 0.5 }, 
  end: { x: 0, y: 1 },
}))`
  width: 100%;
  height: 100%;
  /* Reduzimos o padding inferior para o mínimo (ex: 10px) */
  padding: 20px 20px 10px 40px; 
  justify-content: flex-end;
`;

const EventName = styled.Text`
  color: ${Colors.white};
  font-size: 32px;
  font-weight: bold;
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

export const HeroBanner = ({ event }: any) => {
  const imageSource = eventImages[event.id] || { uri: event.image };

  return (
    <BannerContainer source={imageSource} imageStyle={{ borderRadius: 0 }}>
      <HeroGradient>
        <EventName>
          {event.name}, <StatusTag>now</StatusTag>
        </EventName>
        <ViewMapLink>
          <MapText>View the map</MapText>
        </ViewMapLink>
      </HeroGradient>
    </BannerContainer>
  );
};