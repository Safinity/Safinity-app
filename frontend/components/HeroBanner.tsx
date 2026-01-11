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

const HeroGradient = styled(LinearGradient).attrs(({ theme }) => ({
  colors: ['transparent', theme.colors.background],
  start: { x: 0, y: 0.4 }, // Começa um pouco antes para suavizar
  end: { x: 0, y: 1 },
}))`
  width: 100%;
  height: 100%;
  padding: 20px 20px 20px 40px;
  justify-content: flex-end;
`;

const EventName = styled.Text`
  color: ${Colors.white};
  font-size: 32px;
  font-weight: bold;
`;

const DescriptionText = styled.Text`
  color: ${Colors.white};
  font-size: 18px;
  font-weight: 300;
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

export const HeroBanner = ({ event, title, description, hideMap = false }: any) => {
  const imageSource = eventImages[event.id] || { uri: event.image };

  return (
    <BannerContainer source={imageSource} imageStyle={{ borderRadius: 0 }}>
      <HeroGradient>
        {/* Se houver um 'title' fixo, usa-o. Se não, usa o nome do evento + 'now' */}
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

        {/* Só mostra o link do mapa se não pedirmos para esconder */}
        {!hideMap && (
          <ViewMapLink>
            <MapText>View the map</MapText>
          </ViewMapLink>
        )}
      </HeroGradient>
    </BannerContainer>
  );
};
