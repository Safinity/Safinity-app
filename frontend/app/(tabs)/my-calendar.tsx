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
  padding-top: 50px;
`;

// Criamos um wrapper para aplicar os 30px de margem lateral a todos os blocos
const ContentWrapper = styled.View`
  padding: 0 30px;
`;

const BackButton = styled.TouchableOpacity`
  margin-bottom: 20px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h1.fontFamily};
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 25px;
`;

const DropdownContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  padding: 12px 16px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const DropdownText = styled.Text`
  color: ${({ theme }) => theme.colors.background};
  font-size: 16px;
  font-weight: 600;
`;

const DateSelector = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 40px;
`;

const DateItem = styled.TouchableOpacity`
  align-items: center;
`;

const DateMonth = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: 14px;
  margin-bottom: 8px;
  opacity: 0.6;
`;

const DateCircle = styled.View<{ active?: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 19px;
  background-color: ${({ active, theme }) => (active ? theme.colors.white : 'transparent')};
  justify-content: center;
  align-items: center;
`;

const DateDay = styled.Text<{ active?: boolean }>`
  color: ${({ active, theme }) => (active ? theme.colors.background : theme.colors.white)};
  font-weight: bold;
  font-size: 16px;
`;

const TimelineContainer = styled.View`
  flex: 1;
  /* Garantimos que a timeline também respeite os 30px */
  padding: 0 30px;
`;

const TimeRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 10px;
  height: 100px;
`;

const TimeLabel = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: 12px;
  width: 50px;
  opacity: 0.8;
  padding-top: -5px;
`;

const TimelineContent = styled.View`
  flex: 1;
  position: relative;
`;

const GridLine = styled.View`
  position: absolute;
  top: 8px;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
`;

const EventCard = styled.TouchableOpacity`
  background-color: #e9d9f5;
  border-radius: 20px;
  padding: 15px;
  margin-top: 15px;
  min-height: 80px;
  justify-content: center;
  align-items: center;
`;

const EventTitle = styled.Text`
  color: ${({ theme }) => theme.colors.background};
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 6px;
`;

const LocationRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const LocationText = styled.Text`
  color: ${({ theme }) => theme.colors.background};
  font-size: 12px;
  margin-left: 4px;
`;

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
                <TimeLabel style={{ marginTop: 55, opacity: 0.4 }}>{event.endTime}</TimeLabel>
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
