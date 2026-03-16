import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import calendarData from '../../data/calendar.json';

// --- Styled Components ---

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding-top: ${({ theme }) => theme.spacing.margemTop}px;
`;

const ContentWrapper = styled.View`
  padding: 0 ${({ theme }) => theme.spacing.margemLateral}px;
`;

const BackButton = styled.TouchableOpacity`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.titulo.h};
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const DropdownContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  height: ${({ theme }) => theme.height.sm}px;
`;

const DropdownText = styled.Text`
  color: ${({ theme }) => theme.colors.background};
  font-size: ${({ theme }) => theme.fonts.sizes.base}px;
  font-family: ${({ theme }) => theme.fonts.weights.semibold};
`;

const DateSelector = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xxl}px;
`;

const DateItem = styled.TouchableOpacity`
  align-items: center;
`;

const DateMonth = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fonts.sizes.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  opacity: 0.6;
`;

const DateCircle = styled.View<{ active?: boolean }>`
  width: ${({ theme }) => theme.height.tam_42}px;
  height: ${({ theme }) => theme.height.tam_42}px;
  border-radius: ${({ theme }) => theme.height.tam_42 / 2}px;
  background-color: ${({ active, theme }) => (active ? theme.colors.white : 'rgba(255,255,255,0)')};
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const DateDay = styled.Text<{ active?: boolean }>`
  color: ${({ active, theme }) => (active ? theme.colors.background : theme.colors.white)};
  font-size: ${({ theme }) => theme.fonts.sizes.base}px;
  ${({ theme }) => theme.text.textoPequeno};
`;

const TimelineContainer = styled.View`
  flex: 1;
  padding: 0 ${({ theme }) => theme.spacing.margemLateral}px;
`;

const TimeRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  height: ${({ theme }) => theme.height.md}px;
`;

const TimeLabel = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  width: ${({ theme }) => theme.height.tam_42}px;
  ${({ theme }) => theme.text.label};
  opacity: 0.8;
`;

const TimelineContent = styled.View`
  flex: 1;
  position: relative;
`;

const GridLine = styled.View`
  position: absolute;
  top: ${({ theme }) => theme.spacing.xs}px;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
`;

const EventCard = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.palette.primary.light80};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  min-height: ${({ theme }) => theme.height.sm}px;
  justify-content: center;
  align-items: center;
`;

const EventTitle = styled.Text`
  color: ${({ theme }) => theme.colors.background};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  ${({ theme }) => theme.text.cardsCalendar};
`;

const LocationRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const LocationText = styled.Text`
  color: ${({ theme }) => theme.colors.background};
  font-size: ${({ theme }) => theme.fonts.sizes.xs}px;
  margin-left: ${({ theme }) => theme.spacing.xxs}px;
`;

// --- Screen ---

export default function MyCalendarScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('10');

  const dates = [
    { month: 'Nov', day: '10' },
    { month: 'Nov', day: '11' },
    { month: 'Nov', day: '12' },
    { month: 'Nov', day: '13' },
  ];

  const myEvents = calendarData.activities.filter(ev => ev.id === '8' || ev.id === '2');

  return (
    <Container>
      <ContentWrapper>
        <BackButton onPress={() => router.push('/(tabs)/calendar')}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </BackButton>

        <Title>My calendar</Title>

        <DropdownContainer>
          <DropdownText>Web Summit 2025</DropdownText>
          <Ionicons name="chevron-down" size={22} color="black" />
        </DropdownContainer>

        <DateSelector>
          {dates.map(item => (
            <DateItem key={item.day} onPress={() => setSelectedDate(item.day)}>
              <DateMonth>{item.month}</DateMonth>
              <DateCircle active={selectedDate === item.day}>
                <DateDay active={selectedDate === item.day}>{item.day}</DateDay>
              </DateCircle>
            </DateItem>
          ))}
        </DateSelector>
      </ContentWrapper>

      <ScrollView showsVerticalScrollIndicator={false}>
        <TimelineContainer>
          {myEvents.map(event => (
            <TimeRow key={event.id}>
              <View>
                <TimeLabel>{event.startTime}</TimeLabel>
                <TimeLabel style={{ marginTop: theme.spacing.xl, opacity: 0.4 }}>
                  {event.endTime}
                </TimeLabel>
              </View>

              <TimelineContent>
                <GridLine />
                <EventCard activeOpacity={0.9}>
                  <EventTitle>{event.title}</EventTitle>
                  <LocationRow>
                    <Ionicons name="location" size={14} color={theme.colors.primary} />
                    <LocationText>{event.location}</LocationText>
                  </LocationRow>
                </EventCard>
              </TimelineContent>
            </TimeRow>
          ))}

          <TimeRow>
            <TimeLabel>21h00</TimeLabel>
            <TimelineContent>
              <GridLine />
            </TimelineContent>
          </TimeRow>
        </TimelineContainer>
      </ScrollView>
    </Container>
  );
}
