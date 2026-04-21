import React from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius, TextStyles } from '../../../constants/theme';
import Header from '../../../components/ui/header';
import eventsData from '../../../data/events.json';

const TicketScreen = () => {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const event = eventsData.events.find(e => e.id === eventId);

  if (!event) {
    return (
      <Container>
        <Header variant="back" title="Ticket" showBottomDivider={false} />
        <ErrorText>Event not found</ErrorText>
      </Container>
    );
  }

  const formatEventDate = (start: string, end: string) => {
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
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <Container>
      <Stack.Screen options={{ title: 'Ticket' }} />
      <Header variant="back" title="Ticket" showBottomDivider={false} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: 120,
          paddingHorizontal: Spacing.margemLateral,
          paddingBottom: Spacing.xxl * 2,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Content>
          <TicketCard>
            <TicketHeader>
              <EventName>{event.name}</EventName>
            </TicketHeader>

            <TicketInfo>
              <InfoRow>
                <InfoLabel>Date:</InfoLabel>
                <InfoValue>{formatEventDate(event.start_date, event.end_date)}</InfoValue>
              </InfoRow>

              <InfoRow>
                <InfoLabel>Location:</InfoLabel>
                <InfoValue>{event.location}</InfoValue>
              </InfoRow>

              <InfoRow>
                <InfoLabel>Time:</InfoLabel>
                <InfoValue>
                  {event.start_time} - {event.end_time}
                </InfoValue>
              </InfoRow>

              <InfoRow>
                <InfoLabel>Category:</InfoLabel>
                <InfoValue>{event.category}</InfoValue>
              </InfoRow>

              <DescriptionLabel>Description:</DescriptionLabel>
              <Description>{event.description}</Description>
            </TicketInfo>
          </TicketCard>
        </Content>
      </ScrollView>
    </Container>
  );
};

export default TicketScreen;

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const Content = styled.View`
  flex: 1;
  align-items: center;
`;

const TicketCard = styled.View`
  width: 100%;
  max-width: 350px;
  border-radius: ${BorderRadius.large}px;
  background-color: ${Colors.white};
  padding: ${Spacing.lg}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 5;
`;

const TicketHeader = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.grayNavbar};
  padding-bottom: ${Spacing.md}px;
  margin-bottom: ${Spacing.md}px;
`;

const EventName = styled.Text`
  color: ${Colors.primary};
  font-family: ${TextStyles.titulo.h1.fontFamily};
  font-size: ${TextStyles.titulo.h1.fontSize}px;
  line-height: ${TextStyles.titulo.h1.lineHeight}px;
`;

const TicketInfo = styled.View`
  gap: ${Spacing.md}px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const InfoLabel = styled.Text`
  color: ${Colors.grayNavbar};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  font-weight: 600;
`;

const InfoValue = styled.Text`
  color: ${Colors.white};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  flex: 1;
  text-align: right;
  margin-left: ${Spacing.md}px;
`;

const DescriptionLabel = styled.Text`
  color: ${Colors.grayNavbar};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  font-weight: 600;
  margin-top: ${Spacing.md}px;
`;

const Description = styled.Text`
  color: ${Colors.white};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  line-height: ${TextStyles.corpo.corpoTexto.lineHeight}px;
  margin-top: ${Spacing.xs}px;
`;

const ErrorText = styled.Text`
  color: ${Colors.primary};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  padding: ${Spacing.lg}px;
`;
