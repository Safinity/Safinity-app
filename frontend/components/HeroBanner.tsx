import React from 'react';
import styled from 'styled-components/native';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { ImageBackground } from 'react-native';

const BannerContainer = styled.ImageBackground`
  width: 100%;
  height: 362px;
  justify-content: flex-end;
`;

const GradientOverlay = styled.View`
  background-color: rgba(0, 0, 0, 0.4);
  padding: ${Spacing.lg}px;
  flex: 1;
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
  margin-top: ${Spacing.xs}px;
`;

const MapText = styled.Text`
  color: ${Colors.white};
  font-size: 16px;
  text-decoration-line: underline;
  opacity: 0.8;
`;

export const HeroBanner = ({ event }: any) => (
  <BannerContainer source={{ uri: event.image }} imageStyle={{ borderRadius: 0 }}>
    <GradientOverlay>
      <EventName>
        {event.name}, <StatusTag>now</StatusTag>
      </EventName>
      <ViewMapLink>
        <MapText>View the map</MapText>
      </ViewMapLink>
    </GradientOverlay>
  </BannerContainer>
);
