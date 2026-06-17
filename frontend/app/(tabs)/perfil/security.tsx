import { useAuth, useUser as useClerkUser } from '@clerk/expo';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components/native';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import Header from '../../../components/ui/header';
import { Colors, Spacing, Fonts } from '../../../constants/theme';
import InputField from '../../../components/InputField';
import { getMyProfile } from '../../../utils/profile';

const SecurityScreen = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useClerkUser();
  const [email, setEmail] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);
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

              <SaveButton role="button" accessibilityLabel="Save password changes">
                <SaveButtonText>Save changes</SaveButtonText>
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

const SaveButton = styled.TouchableOpacity`
  background-color: ${Colors.palette.primary.normal};
  border-radius: ${Spacing.md}px;
  padding: ${Spacing.md}px;
  align-items: center;
  margin-top: ${Spacing.md}px;
`;

const SaveButtonText = styled.Text`
  color: ${Colors.white};
  font-family: ${Fonts.weights.semibold};
  font-size: 16px;
`;
