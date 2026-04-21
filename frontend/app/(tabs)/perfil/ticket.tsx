import React from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, TextStyles } from '../../../constants/theme';
import Header from '../../../components/ui/header';
import PrimaryButton from '../../../components/PrimaryButton';
import eventsData from '../../../data/events.json';

const TicketScreen = () => {
  const router = useRouter();
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
            <EventImage source={{ uri: event.image }} />

            {event.time_left && (
              <TimeLeftContainer>
                <TimeLeftLabel>Time Left</TimeLeftLabel>
                <TimeLeftValue>{event.time_left}</TimeLeftValue>
              </TimeLeftContainer>
            )}

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
                <InfoValue>{event.time_left}</InfoValue>
              </InfoRow>

              {event.validity && (
                <InfoRow>
                  <InfoLabel>Validity:</InfoLabel>
                  <InfoValue>{event.validity}</InfoValue>
                </InfoRow>
              )}
            </TicketInfo>

            <ButtonContainer>
              <PrimaryButton
                title="View Event Details"
                onPress={() => router.push(`/event-details/${eventId}`)}
              />
            </ButtonContainer>

            <Divider />

            <BarcodeSection>
              <BarcodeText>0 1 2 3 4 5 6 7 8 9</BarcodeText>
            </BarcodeSection>
          </TicketCard>
        </Content>
      </ScrollView>

      <DeleteButtonContainer>
        <PrimaryButton
          title="Delete Ticket"
          onPress={() => {
            // falta implementar
          }}
        />
      </DeleteButtonContainer>
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
  overflow: hidden;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 5;
`;

const EventImage = styled.Image`
  width: 100%;
  height: 187px;
  background-color: ${Colors.background};
`;

const TimeLeftContainer = styled.View`
  align-items: center;
  padding-vertical: ${Spacing.md}px;
  padding-horizontal: ${Spacing.lg}px;
`;

const TimeLeftLabel = styled.Text`
  color: ${Colors.grayNavbar};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  margin-bottom: ${Spacing.xs}px;
`;

const TimeLeftValue = styled.Text`
  color: ${Colors.primary};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  font-weight: bold;
  text-align: center;
`;

const Divider = styled.View`
  width: 100%;
  height: 8px;
  background-color: ${Colors.background};
`;

const TicketHeader = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.grayNavbar};
  padding-bottom: ${Spacing.md}px;
  margin-bottom: ${Spacing.md}px;
  padding-horizontal: ${Spacing.lg}px;
  padding-top: ${Spacing.md}px;
`;

const EventName = styled.Text`
  color: ${Colors.primary};
  font-family: ${TextStyles.titulo.h1.fontFamily};
  font-size: ${TextStyles.titulo.h1.fontSize}px;
  line-height: ${TextStyles.titulo.h1.lineHeight}px;
`;

const TicketInfo = styled.View`
  gap: ${Spacing.md}px;
  padding-horizontal: ${Spacing.lg}px;
  padding-vertical: ${Spacing.md}px;
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
  color: ${Colors.grayNavbar};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  flex: 1;
  text-align: right;
  margin-left: ${Spacing.md}px;
`;

const ButtonContainer = styled.View`
  padding-horizontal: ${Spacing.lg}px;
  padding-vertical: ${Spacing.md}px;
`;

const BarcodeSection = styled.View`
  height: 116px;
  background-color: ${Colors.white};
  align-items: center;
  justify-content: center;
  border-top-width: 1px;
  border-top-color: ${Colors.grayNavbar};
`;

const BarcodeText = styled.Text`
  color: ${Colors.grayNavbar};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  letter-spacing: 2px;
`;

const ErrorText = styled.Text`
  color: ${Colors.primary};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  padding: ${Spacing.lg}px;
`;

const DeleteButtonContainer = styled.View`
  padding-horizontal: ${Spacing.margemLateral}px;
  padding-bottom: ${Spacing.xxl}px;
  padding-top: ${Spacing.lg}px;
`;
