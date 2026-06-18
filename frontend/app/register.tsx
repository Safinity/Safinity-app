import { useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useAuth, useClerk, useSignUp } from '@clerk/expo';

import InputField from '@/components/InputField';
import Checkbox from '@/components/Checkbox';
import PrimaryButton from '@/components/PrimaryButton';
import Header from '@/components/ui/header';
import { Spacing, Width } from '@/constants/theme';

export default function Register() {
  const { isLoaded } = useAuth();
  const { setActive } = useClerk();
  const { signUp } = useSignUp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [code, setCode] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords entered do not match.');
      return;
    }

    if (!checked) {
      setError('You need to agree to the terms and conditions.');
      return;
    }

    const { error: clerkError } = await signUp.create({
      emailAddress: email,
      password,
      firstName,
      lastName,
    });

    if (clerkError) {
      setError(clerkError.message || 'Unable to create account');
      return;
    }

    const { error: usernameError } = await signUp.update({
      username,
    });

    if (usernameError) {
      setError(usernameError.message || 'Unable to set username');
      return;
    }

    const emailCodeResult = await signUp.verifications.sendEmailCode();

    if (emailCodeResult.error) {
      setError(emailCodeResult.error.message || 'Unable to send verification code');
      return;
    }

    setNeedsVerification(true);
  };

  const handleVerify = async () => {
    setError('');

    const { error: clerkError } = await signUp.verifications.verifyEmailCode({ code });

    if (clerkError) {
      setError(clerkError.message || 'Invalid verification code');
      return;
    }

    if (signUp.createdSessionId) {
      await setActive({ session: signUp.createdSessionId });
      router.replace('/onboarding/step1');
      return;
    }

    router.replace('/onboarding/step1');
  };

  if (!isLoaded) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />

        <Head>
          <title>Register | Safinity</title>
        </Head>

        <LoadingArea />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />

      <Head>
        <title>Register | Safinity</title>
      </Head>

      <Header variant="back" title="Register" subtitle="Create your account here!" />

      <Container>
        <MainArea role="main">
          {needsVerification ? (
            <>
              <InputField
                label="Verification code *"
                placeholder="Verification code"
                keyboardType="numeric"
                value={code}
                onChangeText={setCode}
                accessibilityState={{ required: true }}
              />

              {error ? (
                <ErrorArea accessible={true} accessibilityLiveRegion="assertive" role="alert">
                  <Ionicons
                    name="alert-circle-outline"
                    size={Width.iconAlert}
                    color="#ff4d4d"
                    style={{ marginRight: Spacing.sm }}
                  />
                  <ErrorText>{error}</ErrorText>
                </ErrorArea>
              ) : null}

              <Actions>
                <PrimaryButton
                  title="Verify and continue"
                  onPress={handleVerify}
                  disabled={code === ''}
                />

                <RowWithLink>
                  <SmallText>Need to edit your details?</SmallText>

                  <LinkArea role="link" onPress={() => setNeedsVerification(false)}>
                    <LinkText>Back</LinkText>
                  </LinkArea>
                </RowWithLink>
              </Actions>
            </>
          ) : (
            <>
              <InputRow>
                <InputField
                  label="First Name *"
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  style={{ flex: 1 }}
                  accessibilityState={{ required: true }}
                />

                <InputField
                  label="Last Name *"
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  style={{ flex: 1 }}
                  accessibilityState={{ required: true }}
                />
              </InputRow>

              <InputField
                label="Username *"
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                accessibilityState={{ required: true }}
              />

              <InputField
                label="Email *"
                placeholder="Email"
                icon="mail-outline"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                accessibilityState={{ required: true }}
              />

              <InputField
                label="Password *"
                placeholder="Password"
                password
                value={password}
                onChangeText={setPassword}
                accessibilityState={{ required: true }}
              />

              <InputField
                label="Confirm Password *"
                placeholder="Confirm Password"
                password
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                accessibilityState={{ required: true }}
              />

              {confirmPassword.length > 0 && password !== confirmPassword && (
                <ErrorArea accessible={true} accessibilityLiveRegion="assertive" role="alert">
                  <Ionicons
                    name="alert-circle-outline"
                    size={Width.iconAlert}
                    color="#ff4d4d"
                    style={{ marginRight: Spacing.sm }}
                  />

                  <ErrorText>The passwords entered do not match.</ErrorText>
                </ErrorArea>
              )}

              {error ? (
                <ErrorArea accessible={true} accessibilityLiveRegion="assertive" role="alert">
                  <Ionicons
                    name="alert-circle-outline"
                    size={Width.iconAlert}
                    color="#ff4d4d"
                    style={{ marginRight: Spacing.sm }}
                  />
                  <ErrorText>{error}</ErrorText>
                </ErrorArea>
              ) : null}

              <Actions>
                <CheckboxWrapper>
                  <CheckboxArea
                    onPress={() => setChecked(!checked)}
                    role="checkbox"
                    accessibilityState={{ checked }}
                    accessibilityLabel="I agree to the terms and conditions"
                  >
                    <Checkbox style={{ marginLeft: 8 }} checked={checked} />
                  </CheckboxArea>
                </CheckboxWrapper>

                <PrimaryButton
                  title="Create account"
                  disabled={!checked || password !== confirmPassword || password === ''}
                  onPress={handleRegister}
                />

                <RowWithLink>
                  <SmallText>Already have an account?</SmallText>

                  <LinkArea role="link" onPress={() => router.push('/login')}>
                    <LinkText>Log In</LinkText>
                  </LinkArea>
                </RowWithLink>
              </Actions>
            </>
          )}
        </MainArea>
      </Container>
    </Screen>
  );
}

const Screen = styled.SafeAreaView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Container = styled.View`
  flex: 1;
  padding-top: ${({ theme }) => theme.spacing.xxl}px;
  padding-horizontal: ${({ theme }) => theme.spacing.margemLateral}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const MainArea = styled.View`
  flex: 1;
`;

const LoadingArea = styled.View`
  flex: 1;
`;

const InputRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const Actions = styled.View`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const CheckboxWrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const CheckboxArea = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const RowWithLink = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SmallText = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  ${({ theme }) => theme.text.textoPequeno};
`;

const LinkArea = styled.TouchableOpacity`
  margin-left: ${({ theme }) => theme.spacing.xs}px;
`;

const LinkText = styled.Text`
  color: ${({ theme }) => theme.colors.palette.primary.light80};
  ${({ theme }) => theme.text.textoPequeno};
`;

const ErrorArea = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  font-weight: bold;
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;
