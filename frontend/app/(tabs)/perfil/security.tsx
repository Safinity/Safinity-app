import { useAuth, useUser as useClerkUser } from '@clerk/expo';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components/native';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import Header from '../../../components/ui/header';
import { Colors, Spacing, Fonts } from '../../../constants/theme';
import InputField from '../../../components/InputField';
import { getMyProfile } from '../../../utils/profile';

function getClerkErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return 'Unable to update your password. Please try again.';
  }

  const maybeError = error as {
    errors?: { message?: string; longMessage?: string }[];
    message?: string;
  };
  const firstError = maybeError.errors?.[0];

  return (
    firstError?.longMessage ||
    firstError?.message ||
    maybeError.message ||
    'Unable to update your password. Please try again.'
  );
}

const SecurityScreen = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useClerkUser();
  const [email, setEmail] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    let isActive = true;

    async function loadEmail() {
      if (!isLoaded) {
        return;
      }

      const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? '';

      if (!isSignedIn) {
        setEmail('');
        setIsLoadingEmail(false);
        return;
      }

      try {
        setIsLoadingEmail(true);
        const token = await getTokenRef.current();
        const profile = await getMyProfile(token);

        if (isActive) {
          setEmail(profile.email || clerkEmail);
        }
      } catch (error) {
        console.error('Failed to load security email', error);
        if (isActive) {
          setEmail(clerkEmail);
        }
      } finally {
        if (isActive) {
          setIsLoadingEmail(false);
        }
      }
    }

    loadEmail();

    return () => {
      isActive = false;
    };
  }, [clerkUser?.primaryEmailAddress?.emailAddress, isLoaded, isSignedIn]);

  const handleSavePassword = async () => {
    const currentPasswordValue = currentPassword;
    const newPasswordValue = newPassword;
    const repeatPasswordValue = repeatPassword;

    if (!isLoaded || !isSignedIn || !clerkUser) {
      Alert.alert('Authentication required', 'Please sign in to update your password.');
      return;
    }

    if (clerkUser.passwordEnabled && !currentPasswordValue) {
      Alert.alert('Missing password', 'Please enter your current password.');
      return;
    }

    if (!newPasswordValue || !repeatPasswordValue) {
      Alert.alert('Missing password', 'Please enter and repeat your new password.');
      return;
    }

    if (newPasswordValue.length < 8) {
      Alert.alert('Weak password', 'Your new password must be at least 8 characters.');
      return;
    }

    if (newPasswordValue !== repeatPasswordValue) {
      Alert.alert('Passwords do not match', 'Please repeat the same new password.');
      return;
    }

    if (currentPasswordValue && currentPasswordValue === newPasswordValue) {
      Alert.alert('Same password', 'Please choose a different new password.');
      return;
    }

    try {
      setIsSavingPassword(true);
      await clerkUser.updatePassword({
        currentPassword: currentPasswordValue || undefined,
        newPassword: newPasswordValue,
        signOutOfOtherSessions: false,
      });

      setCurrentPassword('');
      setNewPassword('');
      setRepeatPassword('');
      Alert.alert('Password updated', 'Your password was updated successfully.');
    } catch (error) {
      console.error('Failed to update password', error);
      Alert.alert('Unable to update password', getClerkErrorMessage(error));
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <Container>
      <Stack.Screen options={{ title: 'Password & Security' }} />
      <Header variant="back" title="Password & Security" showBottomDivider={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingTop: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <Content>
            <Section>
              <InputField
                label="Email Address"
                value={isLoadingEmail ? 'Loading...' : email}
                editable={false}
                placeholder="Enter your email"
                keyboardType="email-address"
                icon="mail-outline"
                accessibilityHint="Email address associated with your account"
              />
            </Section>

            <Section>
              <SectionTitle role="header">Change Password</SectionTitle>

              <InputField
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                password={true}
                icon={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                onIconPress={() => setShowCurrentPassword(!showCurrentPassword)}
                accessibilityHint="Enter your current password to confirm your identity"
              />

              <InputField
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                password={true}
                icon={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                onIconPress={() => setShowNewPassword(!showNewPassword)}
                accessibilityHint="Password must be at least 8 characters"
              />

              <InputField
                label="Repeat New Password"
                value={repeatPassword}
                onChangeText={setRepeatPassword}
                placeholder="Repeat new password"
                password={true}
                icon={showRepeatPassword ? 'eye-off-outline' : 'eye-outline'}
                onIconPress={() => setShowRepeatPassword(!showRepeatPassword)}
                accessibilityHint="Repeat the new password exactly as entered above"
              />

              <SaveButton
                role="button"
                accessibilityLabel="Save password changes"
                disabled={isSavingPassword}
                $disabled={isSavingPassword}
                onPress={handleSavePassword}
              >
                {isSavingPassword ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <SaveButtonText>Save changes</SaveButtonText>
                )}
              </SaveButton>
            </Section>
          </Content>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default SecurityScreen;

// Estilos
const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const Content = styled.View`
  padding: 0 ${Spacing.margemLateral}px;
  padding-top: ${Spacing.xl}px;
  margin-top: ${Spacing.xl}px;
  padding-bottom: ${Spacing.xl}px;
`;

const Section = styled.View`
  margin-bottom: ${Spacing.xl}px;
`;

const SectionTitle = styled.Text`
  color: ${Colors.white};
  font-family: ${Fonts.weights.semibold};
  font-size: 18px;
  margin-bottom: ${Spacing.md}px;
`;

const SaveButton = styled.TouchableOpacity<{ $disabled?: boolean }>`
  background-color: ${Colors.palette.primary.normal};
  border-radius: ${Spacing.md}px;
  padding: ${Spacing.md}px;
  align-items: center;
  margin-top: ${Spacing.md}px;
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
`;

const SaveButtonText = styled.Text`
  color: ${Colors.white};
  font-family: ${Fonts.weights.semibold};
  font-size: 16px;
`;
