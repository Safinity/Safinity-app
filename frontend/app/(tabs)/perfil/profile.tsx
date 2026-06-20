import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Stack, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useClerk } from '@clerk/expo';

import { EventCard } from '../../../components/EventCard';
import { Fonts } from '../../../constants/theme';
import { useThemePreference } from '../../../context/ThemeContext';

import EditIcon from '../../../assets/Icons/edit.png';
import Header from '../../../components/ui/header'; // import do header customizado
import {
  deleteMyAccount,
  getMyProfileWithEventImages,
  type AuthenticatedProfile,
} from '../../../utils/profile';
import { getUserImageSource } from '../../../utils/userImages';

function getProfileImageSource(user: AuthenticatedProfile | null) {
  return getUserImageSource(user?.image);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 12000) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Profile request timed out')), timeoutMs);
    }),
  ]);
}

async function clearCachedAuthToken() {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await SecureStore.deleteItemAsync('clerk-token');
  } catch {
    // Best effort cleanup; Clerk signOut is still the source of truth.
  }
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
  background-color: ${({ theme }) => theme.colors.surfaceSoft};
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
  color: ${({ theme }) => theme.colors.text};
  align-self: center;
  margin-top: 10px;
  font-weight: 600;
`;

const Username = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
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
  color: ${({ theme }) => theme.colors.onPrimary};
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
  color: ${({ theme }) => theme.colors.text};
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
  border-bottom-color: ${({ theme }) => theme.colors.border};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ThemeSettingsRow = styled.View`
  padding: 16px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const SettingsText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 16px;
  font-family: ${Fonts.weights.light};
`;

const SettingsIcon = styled.Text`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 24px;
`;

const ThemeControl = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surfaceSoft};
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  padding: ${({ theme }) => theme.spacing.xs}px;
`;

const ThemeOption = styled.Pressable<{ $active: boolean }>`
  min-width: 64px;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
`;

const ThemeOptionText = styled.Text<{ $active: boolean }>`
  color: ${({ $active, theme }) => ($active ? theme.colors.onPrimary : theme.colors.textMuted)};
  font-family: ${Fonts.weights.medium};
  font-size: 13px;
`;

const LogoutButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  padding: 12px 20px;
  margin-top: 24px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  align-self: center;
`;

const LogoutText = styled.Text`
  color: white;
  font-family: ${Fonts.weights.medium};
  font-size: 16px;
`;

const DeleteAccountButton = styled.TouchableOpacity`
  border-width: 1px;
  background-color: ${({ theme }) => theme.colors.palette.primary.light80};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  padding: 12px 20px;
  margin-bottom: ${({ theme }) => theme.spacing.xxl}px;
  align-self: center;
`;

const DeleteAccountText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${Fonts.weights.medium};
  font-size: 16px;
`;

const ModalOverlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background-color: rgba(0, 0, 0, 0.7);
`;

const ModalContent = styled.View`
  width: 100%;
  max-width: 360px;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

const ModalTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const ModalDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  line-height: ${({ theme }) => theme.text.corpo.corpoTexto.lineHeight}px;
`;

const ModalError = styled.Text`
  color: #fca5a5;
  font-family: ${({ theme }) => theme.text.textoPequeno.fontFamily};
  font-size: ${({ theme }) => theme.text.textoPequeno.fontSize}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const ModalActions = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
`;

const ModalButton = styled.TouchableOpacity<{ variant?: 'danger' | 'secondary' }>`
  min-width: 96px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, variant }) =>
    variant === 'danger' ? '#ef4444' : theme.colors.surfaceSoft};
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const ModalButtonText = styled.Text<{ variant?: 'danger' | 'secondary' }>`
  color: ${({ theme, variant }) =>
    variant === 'danger' ? theme.colors.onPrimary : theme.colors.text};
  font-family: ${Fonts.weights.medium};
  font-size: 14px;
`;

const LoadingState = styled.View`
  flex: 1;
  min-height: 400px;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const EmptyText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.text.textoPequeno.fontFamily};
  font-size: ${({ theme }) => theme.text.textoPequeno.fontSize}px;
  padding-left: ${({ theme }) => theme.spacing.margemLateral}px;
`;

export default function Profile() {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemePreference();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const [user, setUser] = useState<AuthenticatedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState('');
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
        const profile = await withTimeout(getMyProfileWithEventImages(token));

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
    await clearCachedAuthToken();
    setUser(null);
    router.replace('/landing');
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      setDeleteAccountError('');
      const token = await withTimeout(getTokenRef.current());
      await withTimeout(deleteMyAccount(token));
      await signOut();
      await clearCachedAuthToken();
      setUser(null);
      router.replace('/landing');
    } catch (deleteError) {
      console.error('Failed to delete account', deleteError);
      setDeleteAccountError('Unable to delete account. Please try again.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Header
          variant="back"
          colorScheme={themeMode === 'light' ? 'light' : 'dark'}
          title="Profile"
          rightIcon="wallet"
          onRightPress={() => router.push('/perfil/wallet')}
        />
        <LoadingState>
          <ActivityIndicator color={theme.colors.primary} />
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
          colorScheme={themeMode === 'light' ? 'light' : 'dark'}
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
      <Modal
        animationType="fade"
        transparent
        visible={isDeleteModalVisible}
        onRequestClose={() => {
          if (!isDeletingAccount) {
            setIsDeleteModalVisible(false);
          }
        }}
      >
        <ModalOverlay>
          <ModalContent role="alert" accessibilityLabel="Delete account confirmation">
            <ModalTitle>Delete account?</ModalTitle>
            <ModalDescription>
              This will permanently delete your Safinity account, friends, tickets and saved data.
            </ModalDescription>
            {deleteAccountError ? <ModalError>{deleteAccountError}</ModalError> : null}
            <ModalActions>
              <ModalButton
                variant="secondary"
                disabled={isDeletingAccount}
                onPress={() => setIsDeleteModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel account deletion"
              >
                <ModalButtonText variant="secondary">Cancel</ModalButtonText>
              </ModalButton>
              <ModalButton
                variant="danger"
                disabled={isDeletingAccount}
                onPress={handleDeleteAccount}
                accessibilityRole="button"
                accessibilityLabel="Confirm account deletion"
              >
                <ModalButtonText variant="danger">
                  {isDeletingAccount ? 'Deleting...' : 'Delete'}
                </ModalButtonText>
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      </Modal>

      {/* Header Customizado */}
      <Header
        variant="back"
        colorScheme={themeMode === 'light' ? 'light' : 'dark'}
        title="Profile"
        rightIcon="wallet"
        onRightPress={() => router.push('/perfil/wallet')}
      />

      <TopGradient
        colors={[theme.colors.profileGradientStart, theme.colors.profileGradientEnd]}
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

        <ThemeSettingsRow accessibilityLabel="Theme settings">
          <SettingsText>Theme</SettingsText>
          <ThemeControl>
            <ThemeOption
              $active={themeMode === 'light'}
              onPress={() => setThemeMode('light')}
              accessibilityRole="button"
              accessibilityLabel="Use light theme"
              accessibilityState={{ selected: themeMode === 'light' }}
            >
              <ThemeOptionText $active={themeMode === 'light'}>Light</ThemeOptionText>
            </ThemeOption>
            <ThemeOption
              $active={themeMode === 'dark'}
              onPress={() => setThemeMode('dark')}
              accessibilityRole="button"
              accessibilityLabel="Use dark theme"
              accessibilityState={{ selected: themeMode === 'dark' }}
            >
              <ThemeOptionText $active={themeMode === 'dark'}>Dark</ThemeOptionText>
            </ThemeOption>
          </ThemeControl>
        </ThemeSettingsRow>

        <SettingsRow role="button" accessibilityLabel="Terms and conditions">
          <SettingsText>Terms and Conditions</SettingsText>
          <SettingsIcon accessible={false}>›</SettingsIcon>
        </SettingsRow>

        <LogoutButton onPress={handleLogout} role="button" accessibilityLabel="Log out of the app">
          <LogoutText>Log out</LogoutText>
        </LogoutButton>
        <DeleteAccountButton
          onPress={() => {
            setDeleteAccountError('');
            setIsDeleteModalVisible(true);
          }}
          role="button"
          accessibilityLabel="Delete account"
        >
          <DeleteAccountText>Delete account</DeleteAccountText>
        </DeleteAccountButton>
      </PaddedContent>
    </Container>
  );
}
