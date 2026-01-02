import React from 'react';
import styled from 'styled-components/native';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

const CardContainer = styled.TouchableOpacity`
  width: 280px;
  height: 380px;
  margin-right: ${Spacing.md}px;
  border-radius: ${BorderRadius.large}px;
  overflow: hidden;
`;

const BackgroundImage = styled.ImageBackground`
  flex: 1;
  padding: ${Spacing.md}px;
  justify-content: space-between;
`;

const TimeBadge = styled.View`
  background-color: rgba(146, 66, 204, 0.6);
  align-self: flex-end;
  padding: 4px 12px;
  border-radius: ${BorderRadius.round}px;
`;

const TimeText = styled.Text`
  color: ${Colors.white};
  font-size: 12px;
`;

const CardFooter = styled.View`
  background-color: rgba(0, 0, 0, 0.1);
`;

const DateText = styled.Text`
  color: ${Colors.inactive};
  font-size: 14px;
`;

const TitleText = styled.Text`
  color: ${Colors.white};
  font-size: 20px;
  font-weight: bold;
`;

export const EventCard = ({ event }: any) => (
  <CardContainer>
    <BackgroundImage source={{ uri: event.image }}>
      {event.time_left && (
        <TimeBadge>
          <TimeText>{event.time_left}</TimeText>
        </TimeBadge>
      )}
      <CardFooter>
        <DateText>
          {event.start_date} - {event.end_date}
        </DateText>
        <TitleText>{event.name}</TitleText>
      </CardFooter>
    </BackgroundImage>
  </CardContainer>
);
