import { useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useAuth, useClerk, useSignUp } from '@clerk/expo';
import { TextInput, TouchableOpacity, View } from 'react-native';

import Checkbox from '@/components/Checkbox';
import PrimaryButton from '@/components/PrimaryButton';
import Header from '@/components/ui/header';
import { Height, Spacing, Width } from '@/constants/theme';

export default function Register() {
  const theme = useTheme();
  const { isLoaded } = useAuth();
  const { setActive } = useClerk();
  const { signUp } = useSignUp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
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

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      if (result.status === 'missing_requirements') {
        setError('Missing requirements to complete registration.');
        return;
      }

      await signUp.update({
        username,
      });

      await signUp.verifications.sendEmailCode();
      setNeedsVerification(true);
    } catch (clerkError: any) {
      setError(clerkError.errors?.[0]?.message || clerkError.message || 'Unable to create account');
    }
  };

  const handleVerify = async () => {
    setError('');

    try {
      const result = await signUp.verifications.verifyEmailCode({ code });

      if (result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.replace('/onboarding/step1');
        return;
      }

      router.replace('/onboarding/step1');
    } catch (clerkError: any) {
      setError(clerkError.errors?.[0]?.message || clerkError.message || 'Invalid verification code');
    }
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

      <Header 
        variant="back" 
        title="Register" 
        subtitle="Create your account here!" 
        titleColor={theme.colors.text}
        subtitleColor={theme.colors.text}
      />

      <Container>
        <MainArea role="main">
          {needsVerification ? (
            <>
              <SemanticLabel color={theme.colors.text}>Verification code *</SemanticLabel>
              {/* Alteração: Removido o borderColor */}
              <InputWrapper color={theme.colors.palette.primary.light90}>
                <NativeInputField
                  color={theme.colors.text}
                  placeholder="Verification code"
                  placeholderTextColor={theme.colors.inactive}
                  keyboardType="numeric"
                  value={code}
                  onChangeText={setCode}
                />
              </InputWrapper>

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
                  color={theme.colors.primary}
                />

                <RowWithLink>
                  <SmallText>Need to edit your details?</SmallText>
                  <LinkArea role="link" onPress={() => setNeedsVerification(false)}>
                    <LinkText color={theme.colors.palette.primary.light40}>Back</LinkText>
                  </LinkArea>
                </RowWithLink>
              </Actions>
            </>
          ) : (
            <>
              <InputRow>
                <View style={{ flex: 1 }}>
                  <SemanticLabel color={theme.colors.text}>First Name *</SemanticLabel>
                  {/* Alteração: Removido o borderColor de todos os inputs abaixo */}
                  <InputWrapper color={theme.colors.palette.primary.light90}>
                    <NativeInputField
                      color={theme.colors.text}
                      placeholder="First Name"
                      placeholderTextColor={theme.colors.inactive}
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </InputWrapper>
                </View>

                <View style={{ flex: 1 }}>
                  <SemanticLabel color={theme.colors.text}>Last Name *</SemanticLabel>
                  <InputWrapper color={theme.colors.palette.primary.light90}>
                    <NativeInputField
                      color={theme.colors.text}
                      placeholder="Last Name"
                      placeholderTextColor={theme.colors.inactive}
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </InputWrapper>
                </View>
              </InputRow>

              <SemanticLabel color={theme.colors.text}>Username *</SemanticLabel>
              <InputWrapper color={theme.colors.palette.primary.light90}>
                <NativeInputField
                  color={theme.colors.text}
                  placeholder="Username"
                  placeholderTextColor={theme.colors.inactive}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </InputWrapper>

              <SemanticLabel color={theme.colors.text}>Email *</SemanticLabel>
              <InputWrapper color={theme.colors.palette.primary.light90}>
                <Ionicons name="mail-outline" size={Width.iconSocial} color={theme.colors.inactive} style={{ marginRight: Spacing.sm }} />
                <NativeInputField
                  color={theme.colors.text}
                  placeholder="Email"
                  placeholderTextColor={theme.colors.inactive}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </InputWrapper>

              <SemanticLabel color={theme.colors.text}>Password *</SemanticLabel>
              <InputWrapper color={theme.colors.palette.primary.light90}>
                <NativeInputField
                  color={theme.colors.text}
                  placeholder="Password"
                  placeholderTextColor={theme.colors.inactive}
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Ionicons
                    name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                    size={Width.iconSocialLarge}
                    color={theme.colors.inactive}
                  />
                </TouchableOpacity>
              </InputWrapper>

              <SemanticLabel color={theme.colors.text}>Confirm Password *</SemanticLabel>
              <InputWrapper color={theme.colors.palette.primary.light90}>
                <NativeInputField
                  color={theme.colors.text}
                  placeholder="Confirm Password"
                  placeholderTextColor={theme.colors.inactive}
                  secureTextEntry={!isConfirmPasswordVisible}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                  <Ionicons
                    name={isConfirmPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                    size={Width.iconSocialLarge}
                    color={theme.colors.inactive}
                  />
                </TouchableOpacity>
              </InputWrapper>

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
  color={theme.colors.primary} // Use apenas esta prop
/>

                <RowWithLink>
                  <SmallText>Already have an account?</SmallText>
                  <LinkArea role="link" onPress={() => router.push('/login')}>
                    <LinkText color={theme.colors.palette.primary.light40}>Log In</LinkText>
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

// --- Styled Components ---

const Screen = styled.SafeAreaView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Container = styled.View`
  flex: 1;
  padding-top: ${Spacing.xxl}px;
  padding-horizontal: ${Spacing.margemLateral}px;
  padding-bottom: ${Spacing.md}px;
`;

const MainArea = styled.View`
  flex: 1;
`;

const LoadingArea = styled.View`
  flex: 1;
`;

const InputRow = styled.View`
  flex-direction: row;
  gap: ${Spacing.md}px;
`;

const SemanticLabel = styled.Text<{ color: string }>`
  font-family: ${({ theme }) => theme.fonts.weights.medium};
  font-size: ${({ theme }) => theme.fonts.sizes.base}px;
  color: ${props => props.color};
  margin-bottom: ${Spacing.xs}px;
  margin-top: ${Spacing.md}px;
`;

{/* Alteração: Removido propriedades border-width e border-color para eliminar o stroke */}
const InputWrapper = styled.View<{ color: string }>`
  height: ${Height.socialButton}px;
  /* Forçamos o fundo para branco se for light mode, ou mantemos a cor de fundo do tema */
  background-color: ${({ theme, color }) => 
    (theme.colors.mode === 'light') ? '#FFFFFF' : color};
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  flex-direction: row;
  align-items: center;
  padding-horizontal: ${Spacing.sm}px;
`;

const NativeInputField = styled(TextInput)`
  flex: 1;
  height: 100%;
  font-family: ${({ theme }) => theme.fonts.weights.regular};
  font-size: ${({ theme }) => theme.fonts.sizes.base}px;
  /* Forçamos a cor do texto para preto puro (#000000) */
  /* Assim garantimos que fica legível sobre o fundo branco */
  color: #000000;
`;

const Actions = styled.View`
  margin-top: ${Spacing.sm}px;
`;

const CheckboxWrapper = styled.View`
  margin-top: ${Spacing.md}px;
  margin-bottom: ${Spacing.lg}px;
`;

const CheckboxArea = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const RowWithLink = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: ${Spacing.md}px;
  margin-bottom: ${Spacing.md}px;
`;

const SmallText = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  font-family: ${({ theme }) => theme.fonts.weights.regular};
  font-size: ${({ theme }) => theme.fonts.sizes.sm}px;
`;

const LinkArea = styled.TouchableOpacity`
  margin-left: ${Spacing.xs}px;
`;

const LinkText = styled.Text<{ color?: string }>`
  color: ${props => props.color || props.theme.colors.palette.primary.light80};
  font-family: ${({ theme }) => theme.fonts.weights.semibold};
  font-size: ${({ theme }) => theme.fonts.sizes.sm}px;
`;

const ErrorArea = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${Spacing.sm}px;
  margin-top: ${Spacing.md}px;
`;

const ErrorText = styled.Text`
  color: #ff4d4d;
  font-family: ${({ theme }) => theme.fonts.weights.medium};
  font-size: ${({ theme }) => theme.fonts.sizes.sm}px;
`;