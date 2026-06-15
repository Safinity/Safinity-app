import { ActivityIndicator, FlatList, Pressable, ScrollView, View } from 'react-native';
import { Stack, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useClerk } from '@clerk/expo';

import { EventCard } from '../../../components/EventCard';
import { Fonts } from '../../../constants/theme';

import EditIcon from '../../../assets/Icons/edit.png';
import Header from '../../../components/ui/header'; // import do header customizado
import { getMyProfile, type AuthenticatedProfile } from '../../../utils/profile';

function getProfileImageSource(user: AuthenticatedProfile | null) {
  if (user?.image) {
    return { uri: `data:image/jpeg;base64,${user.image}` };
  }

  return null;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 12000) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Profile request timed out')), timeoutMs);
    }),
  ]);
}

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

const DefaultAvatarIcon = styled(Ionicons).attrs({
  name: 'person',
  size: 72,
})`
  color: ${({ theme }) => theme.colors.palette.neutral.neutral80};
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

const LoadingState = styled.View`
  flex: 1;
  min-height: 400px;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const EmptyText = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  font-family: ${({ theme }) => theme.text.textoPequeno.fontFamily};
  font-size: ${({ theme }) => theme.text.textoPequeno.fontSize}px;
  padding-left: ${({ theme }) => theme.spacing.margemLateral}px;
`;

export default function Profile() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const [user, setUser] = useState<AuthenticatedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    if (isLoaded) {
      return;
    }

    setIsLoading(true);

    const timeoutId = setTimeout(() => {
      setError('Authentication is taking too long.');
      setIsLoading(false);
    }, 12000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoaded]);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        setUser(null);
        setError('Please sign in to view your profile.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const token = await withTimeout(getTokenRef.current());
        const profile = await withTimeout(getMyProfile(token));

        if (isActive) {
          setUser(profile);
        }
      } catch (profileError) {
        console.error('Failed to load profile', profileError);
        if (isActive) {
          setUser(null);
          setError('Unable to load profile.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [isLoaded, isSignedIn]);

  const imageSource = getProfileImageSource(user);
  const userPastEvents = user?.user_tickets?.map(ticket => ticket.event).filter(Boolean) ?? [];

  const handleLogout = async () => {
    await signOut();
    router.replace('/landing');
  };

  if (isLoading) {
    return (
      <Container>
        <Header
          variant="back"
          title="Profile"
          rightIcon="wallet"
          onRightPress={() => router.push('/perfil/wallet')}
        />
        <LoadingState>
          <ActivityIndicator color="white" />
          <LoadingText>Loading...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container>
        <Header
          variant="back"
          title="Profile"
          rightIcon="wallet"
          onRightPress={() => router.push('/perfil/wallet')}
        />
        <LoadingState>
          <LoadingText>{error || 'Unable to load profile.'}</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Stack.Screen options={{ title: 'Profile' }} />

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
            {imageSource ? (
              <Avatar source={imageSource} accessibilityLabel={`Profile picture of ${user.name}`} />
            ) : (
              <DefaultAvatarIcon accessibilityLabel="Default profile picture" />
            )}
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

        <Name>{user.name || user.email || 'Safinity user'}</Name>
        <Username>@{user.username || 'user'}</Username>

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
        ListEmptyComponent={<EmptyText>No past events yet</EmptyText>}
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

        <LogoutButton onPress={handleLogout} role="button" accessibilityLabel="Log out of the app">
          <LogoutText>Log out</LogoutText>
        </LogoutButton>
      </PaddedContent>
    </Container>
  );
}
