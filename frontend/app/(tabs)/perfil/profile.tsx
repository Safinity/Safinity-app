import { FlatList, ScrollView, Pressable, View } from 'react-native';
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
//import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { userImages } from '../../../assets/images/Users/userImages';
import { EventCard } from '../../../components/EventCard';
import { Fonts } from '../../../constants/theme';
import auth from '../../../data/auth.json';
import eventsData from '../../../data/events.json';
import users from '../../../data/users.json';

import EditIcon from '../../../assets/Icons/edit.png';
import Header from '../../../components/ui/header'; // import do header customizado

const Container = styled(ScrollView).attrs({
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TopGradient = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 33%;
  z-index: 0;
`;

const AvatarContainer = styled.View`
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
  position: relative;
  width: 160px;
  align-self: center;
  z-index: 1;
`;

const AvatarCircle = styled.View`
  width: ${({ theme }) => theme.height.profileAvatar}px;
  height: ${({ theme }) => theme.height.profileAvatar}px;
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
`;

const Name = styled.Text`
  font-size: 22px;
  color: white;
  align-self: center;
  margin-top: 10px;
  font-weight: 600;
`;

const Username = styled.Text`
  font-size: 14px;
  color: #ccc;
  align-self: center;
  margin-top: 4px;
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
`;

const LinkButtonText = styled.Text`
  color: white;
  font-family: ${Fonts.weights.medium};
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h1.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h1.fontSize}px;
`;

const SeeMore = styled.Text`
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  line-height: ${({ theme }) => theme.text.corpo.corpoTexto.lineHeight}px;
  color: ${({ theme }) => theme.colors.primary_50};
  padding: 5px;
`;

const SettingsRow = styled.TouchableOpacity`
  padding: 16px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.grayNavbar};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SettingsText = styled.Text`
  color: #ccc;
  font-size: 16px;
  font-family: ${Fonts.weights.light};
`;

const SettingsIcon = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: 24px;
`;

const LogoutButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  padding: 12px 20px;
  margin-top: 24px;
  margin-bottom: ${({ theme }) => theme.spacing.xxl}px;
  align-self: center;
`;

const LogoutText = styled.Text`
  color: white;
  font-family: ${Fonts.weights.medium};
  font-size: 16px;
`;

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
      setImageSource(userImage);
    }
  }, []);

  if (!user || !imageSource) return null;

  const userPastEvents = eventsData.events.filter(event => user.pastEvents.includes(event.id));

  return (
    <Container>
      {/* Header Customizado */}
      <Header
        variant="back"
        title="Profile"
        rightIcon="wallet"
        onRightPress={() => router.push('/perfil/wallet')}
      />

      <TopGradient
        colors={['rgba(190, 142, 224)', 'rgba(34, 39, 52, 0)']}
        locations={[0, 0.33]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 3 }}
      />

      <PaddedContent style={{ marginTop: 120 }}>
        <AvatarContainer>
          <AvatarCircle>
            <Avatar source={imageSource} accessibilityLabel={`Profile picture of ${user.name}`} />
          </AvatarCircle>
          <EditButtonContainer
            onPress={() => router.push('/perfil/edit-profile')}
            role="button"
            accessibilityLabel="Edit profile picture"
          >
            <EditIconCircle>
              <EditImage source={EditIcon} accessible={false} />
            </EditIconCircle>
          </EditButtonContainer>
        </AvatarContainer>

        <Name>{user.name}</Name>
        <Username>@{user.username}</Username>

        <LinkButton role="button" accessibilityLabel="Link my ticket">
          <LinkButtonText>Link my ticket</LinkButtonText>
        </LinkButton>

        <SectionHeader>
          <SectionTitle role="header">Past Events</SectionTitle>
          <Pressable
            onPress={() => router.push('/events-list')}
            role="button"
            accessibilityLabel="See more past events"
          >
            <SeeMore>See more</SeeMore>
          </Pressable>
        </SectionHeader>
      </PaddedContent>

      <FlatList
        horizontal
        data={userPastEvents}
        renderItem={({ item }) => (
          <View style={{ width: 280, marginRight: 16 }}>
            <EventCard event={item} />
          </View>
        )}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 40, paddingRight: 40 }}
        role="list"
        accessibilityLabel="Past events"
      />

      <PaddedContent>
        <View style={{ marginTop: 40 }}>
          <SectionTitle role="header">Settings</SectionTitle>
        </View>

        <SettingsRow
          onPress={() => router.push('/perfil/notifications-settings')}
          role="button"
          accessibilityLabel="Notifications settings"
        >
          <SettingsText>Notifications</SettingsText>
          <SettingsIcon accessible={false}>›</SettingsIcon>
        </SettingsRow>

        <SettingsRow
          onPress={() => router.push('/perfil/security')}
          role="button"
          accessibilityLabel="Password and security settings"
        >
          <SettingsText>Password and Security</SettingsText>
          <SettingsIcon accessible={false}>›</SettingsIcon>
        </SettingsRow>

        <SettingsRow role="button" accessibilityLabel="Theme settings">
          <SettingsText>Theme</SettingsText>
          <SettingsIcon accessible={false}>›</SettingsIcon>
        </SettingsRow>

        <SettingsRow role="button" accessibilityLabel="Terms and conditions">
          <SettingsText>Terms and Conditions</SettingsText>
          <SettingsIcon accessible={false}>›</SettingsIcon>
        </SettingsRow>

        <LogoutButton
          onPress={() => router.push('../../landing')}
          role="button"
          accessibilityLabel="Log out of the app"
        >
          <LogoutText>Log out</LogoutText>
        </LogoutButton>
      </PaddedContent>
    </Container>
  );
}
