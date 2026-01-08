import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import users from '../data/users.json';
import auth from '../data/auth.json';
import { EventCard } from '../components/EventCard';
import eventsData from '../data/events.json';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentId = auth.currentUserId;
    const foundUser = users.find(u => u.id === currentId);
    setUser(foundUser);
  }, []);

  if (!user) return null;

  const userPastEvents = eventsData.events.filter(event => user.pastEvents.includes(event.id));

  return (
    <Container>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 10 }}>
        <Ionicons name="arrow-back" size={26} color="white" />
      </TouchableOpacity>

      <Title>Profile</Title>
      <Avatar source={{ uri: user.image }} />
      <Name>{user.name}</Name>
      <Username>@{user.username}</Username>
      <LinkButton>
        <LinkButtonText>Link my ticket</LinkButtonText>
      </LinkButton>

      <SectionHeader>
        <SectionTitle>Past Events</SectionTitle>
        <SeeMore>See more</SeeMore>
      </SectionHeader>

      <EventsContainer>
        <FlatList
          horizontal
          nestedScrollEnabled
          scrollEnabled={true}
          data={userPastEvents}
          renderItem={({ item }) => (
            <EventWrapper>
              <EventCard event={item} />
            </EventWrapper>
          )}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 0, paddingRight: 0 }}
          snapToInterval={280 + 16}
          decelerationRate="fast"
        />
      </EventsContainer>

      <SectionTitle>Settings</SectionTitle>

      <SettingsRow>
        <SettingsText>Notifications</SettingsText>
      </SettingsRow>

      <SettingsRow>
        <SettingsText>Password and Security</SettingsText>
      </SettingsRow>

      <SettingsRow>
        <SettingsText>Terms and Conditions</SettingsText>
      </SettingsRow>

      <LogoutButton>
        <LogoutText>Log out</LogoutText>
      </LogoutButton>
    </Container>
  );
}

/* ----------------------------- STYLES ----------------------------- */

const Container = styled(ScrollView)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.margemLateral}px;
`;

const Avatar = styled.Image`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  margin-bottom: 12px;
`;

const Title = styled.Text`
  font-family: ${({ theme }) => theme.text.titulo.h.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h.fontSize}px;
  color: ${({ theme }) => theme.colors.white};
  align-self: flex-start;
`;

const Name = styled.Text`
  font-family: ${({ theme }) => theme.text.titulo.h1.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h1.fontSize}px;
  color: ${({ theme }) => theme.colors.palette.primary.light90};
  align-self: center;
`;

const Username = styled.Text`
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  color: ${({ theme }) => theme.colors.palette.primary.light90};
  margin-top: 4px;
  align-self: center;
`;

const LinkButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  padding: 10px 20px;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  align-self: center;
`;

const LinkButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-weight: ${({ theme }) => theme.text.botao.fontFamily};
`;

const SectionHeader = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 40px;
`;

const SectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.text.titulo.h2.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h2.fontSize}px;
  color: ${({ theme }) => theme.colors.palette.primary.light90};
  align-self: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const SeeMore = styled.Text`
  font-family: ${({ theme }) => theme.fonts.weights.light};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  color: ${({ theme }) => theme.colors.primary_50};
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const EventsContainer = styled.View`
  width: 100%;
  overflow: visible;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const EventWrapper = styled.View`
  width: 280px;
  margin-right: 16px;
`;

const SettingsRow = styled.TouchableOpacity`
  width: 100%;
  padding-vertical: 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.grayNavbar};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SettingsText = styled.Text`
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  color: ${({ theme }) => theme.colors.palette.primary.light80};
`;

const LogoutButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  padding: 10px 20px;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  align-self: center;
`;

const LogoutText = styled.Text`
  font-weight: ${({ theme }) => theme.text.botao.fontFamily};
  color: ${({ theme }) => theme.colors.white};
`;
