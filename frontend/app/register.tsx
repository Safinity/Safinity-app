import { useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import Head from 'expo-router/head';

import InputField from '@/components/InputField';
import Checkbox from '@/components/Checkbox';
import PrimaryButton from '@/components/PrimaryButton';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [checked, setChecked] = useState(false);

  return (
    <Screen>
      <Container>
        <Stack.Screen options={{ title: 'Register | Safinity', headerShown: false }} />
        <Head>
          <title>Register | Safinity</title>
        </Head>

        <HeadingArea accessibilityRole="header">
          <BackButton
            onPress={() => router.back()}
            accessibilityLabel="Return to the previous page"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={26} color="white" />
          </BackButton>
          <Title accessibilityHeadingLevel={1}>Register</Title>
          <Subtitle accessibilityHeadingLevel={2}>Create your account here!</Subtitle>
        </HeadingArea>

        <MainArea accessibilityRole="main">
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
            password // Ativa a lógica do olho
            value={password}
            onChangeText={setPassword}
            accessibilityState={{ required: true }}
          />

          <InputField
            label="Confirm Password *"
            placeholder="Confirm Password"
            password // Ativa a lógica do olho
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            accessibilityState={{ required: true }}
          />

          {confirmPassword.length > 0 && password !== confirmPassword && (
            <ErrorArea accessibilityLiveRegion="assertive" accessibilityRole="alert">
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color="#ff4d4d"
                style={{ marginRight: 8 }}
              />
              <ErrorText>The passwords entered do not match.</ErrorText>
            </ErrorArea>
          )}

          <Actions>
            <CheckboxWrapper>
              <CheckboxArea
                onPress={() => setChecked(!checked)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: checked }}
                accessibilityLabel="I agree to the terms and conditions"
              >
                <Checkbox style={{ marginLeft: 8 }} checked={checked} />
              </CheckboxArea>
            </CheckboxWrapper>

            <PrimaryButton
              title="Create account"
              disabled={!checked || password !== confirmPassword || password === ''}
              onPress={() => router.push('/onboarding')}
            />

            <RowWithLink>
              <SmallText>Already have an account?</SmallText>
              <LinkArea accessibilityRole="link" onPress={() => router.push('/login')}>
                <LinkText>Log In</LinkText>
              </LinkArea>
            </RowWithLink>
          </Actions>
        </MainArea>
      </Container>
    </Screen>
  );
}

// --------------------------------------------------------- Styled Components -------------------------------------------------------

const Screen = styled.SafeAreaView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Container = styled.ScrollView.attrs(({ theme }) => ({
  contentContainerStyle: {
    padding: theme.spacing.xl,
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
}))``;

const HeadingArea = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  ${({ theme }) => theme.text.titulo.h1};
`;

const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;

const BackButton = styled.TouchableOpacity`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const MainArea = styled.View`
  flex: 1;
`;

const InputRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const Actions = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
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
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;
