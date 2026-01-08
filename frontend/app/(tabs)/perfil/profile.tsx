import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import Header from '../../../components/ui/header';
import { LinearGradient } from 'expo-linear-gradient';

import { userImages } from '../../../assets/images/Users/userImages';
import { EventCard } from '../../../components/EventCard';
import { Fonts } from '../../../constants/theme';
import auth from '../../../data/auth.json';
import eventsData from '../../../data/events.json';
import users from '../../../data/users.json';

import EditIcon from '../../../assets/Icons/edit.png';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [imageSource, setImageSource] = useState<any>(null);

  useEffect(() => {
    const currentId = auth.currentUserId;
    const foundUser = users.find(u => u.id === currentId);
    setUser(foundUser);

    if (foundUser) {
      const imageFileName = foundUser.image;

      const userImage = userImages[imageFileName] || userImages['default'];

      if (userImage) {
        setImageSource(userImage);
      } else {
        console.warn(`Imagem não encontrada para: ${imageFileName}`);
        setImageSource(userImages['default']);
      }
    }
  }, []);

  if (!user || !imageSource) {
    return null;
  }

  const userPastEvents = eventsData.events.filter(event => user.pastEvents.includes(event.id));

  const handleEditProfile = () => {
    router.push('/perfil/edit-profile');
  };

  const handleNotifications = () => {
    router.push('/perfil/notifications-settings');
  };

  const handleSecurity = () => {
    router.push('/perfil/security');
  };

  return (
    <Container>
      <TopGradient
        colors={['rgba(190, 142, 224)', 'rgba(34, 39, 52, 0)']}
        locations={[0, 0.33]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 3 }}
      />

      <Header variant="back" title="Profile" />

      <PaddedContent>
        <AvatarContainer>
          <CircleContainer>
            <AvatarCircle>
              <Avatar source={imageSource} />
            </AvatarCircle>
          </CircleContainer>

          <EditButtonContainer onPress={handleEditProfile}>
            <EditIconCircle>
              <EditImage source={EditIcon} />
            </EditIconCircle>
          </EditButtonContainer>
        </AvatarContainer>

        <Name>{user.name}</Name>
        <Username>@{user.username}</Username>

        <LinkButton>
          <LinkButtonText>Link my ticket</LinkButtonText>
        </LinkButton>

        <SectionHeader>
          <SectionTitle>Past Events</SectionTitle>
          <SeeMore>See more</SeeMore>
        </SectionHeader>
      </PaddedContent>

      <EventsContainer>
        <FlatList
          horizontal
          data={userPastEvents}
          renderItem={({ item }) => (
            <EventWrapper>
              <EventCard event={item} />
            </EventWrapper>
          )}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
        />
      </EventsContainer>

      <PaddedContent>
        <SectionTitle>Settings</SectionTitle>

        <SettingsRow onPress={handleNotifications}>
          <SettingsText>Notifications</SettingsText>
          <SettingsIcon>›</SettingsIcon>
        </SettingsRow>

        <SettingsRow onPress={handleSecurity}>
          <SettingsText>Password and Security</SettingsText>
          <SettingsIcon>›</SettingsIcon>
        </SettingsRow>
        <SettingsRow>
          <SettingsText>Terms and Conditions</SettingsText>
          <SettingsIcon>›</SettingsIcon>
        </SettingsRow>

        <LogoutButton>
          <LogoutText>Log out</LogoutText>
        </LogoutButton>
      </PaddedContent>
    </Container>
  );
}

const Container = styled(ScrollView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TopGradient = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 33%; /* 1/3 da página */
  z-index: 0;
`;

const AvatarContainer = styled.View`
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.xxl}px;
  margin-bottom: 20px;
  position: relative;
  width: 160px;
  align-self: center;
  z-index: 1;
`;

const CircleContainer = styled.View`
  z-index: 1;
`;

const AvatarCircle = styled.View`
  width: 160px;
  height: 160px;
  border-radius: 80px;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
  align-items: center;
  justify-content: center;
`;

const Avatar = styled.Image`
  width: 100%;
  height: 100%;
`;

const EditButtonContainer = styled.TouchableOpacity`
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 10;
`;

const EditIconCircle = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: ${({ theme }) => theme.colors.palette.primary.light90};
  align-items: center;
  justify-content: center;
`;

const EditImage = styled.Image`
  width: 18px;
  height: 18px;
`;

const PaddedContent = styled.View`
  padding: 0 ${({ theme }) => theme.spacing.margemLateral}px;
  z-index: 1;
  position: relative;
`;

const Name = styled.Text`
  font-size: 22px;
  color: white;
  align-self: center;
  margin-top: 10px;
  font-weight: 600;
  z-index: 1;
`;

const Username = styled.Text`
  font-size: 14px;
  color: #ccc;
  align-self: center;
  margin-top: 4px;
  z-index: 1;
`;

const LinkButton = styled.TouchableOpacity`
  height: 48px;
  width: 202px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  padding: 10px 20px;
  margin: 24px 0;
  align-self: center;
  z-index: 1;
`;

const LinkButtonText = styled.Text`
  color: white;
  font-family: ${Fonts.weights.medium};
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  z-index: 1;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  color: white;
  font-weight: 600;
`;

const SeeMore = styled.Text`
  color: ${({ theme }) => theme.colors.palette.primary.light50};
  font-size: 14px;
`;

const EventsContainer = styled.View`
  margin-bottom: 32px;
  margin-left: ${({ theme }) => theme.spacing.margemLateral}px;
  z-index: 1;
  position: relative;
`;

const EventWrapper = styled.View`
  width: 280px;
  margin-right: 16px;
`;

const SettingsRow = styled.TouchableOpacity`
  padding: 16px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.grayNavbar};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
  position: relative;
`;

const SettingsText = styled.Text`
  color: #ccc;
  font-size: 16px;
  font-family: ${Fonts.weights.light};
`;

const SettingsIcon = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: 24px;
  font-family: ${Fonts.weights.medium};
`;

const LogoutButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  padding: 12px 20px;
  margin-top: 24px;
  margin-bottom: 110px;
  align-self: center;
  z-index: 1;
  position: relative;
`;

const LogoutText = styled.Text`
  color: white;
  font-family: ${Fonts.weights.medium};
  font-size: 16px;
`;
