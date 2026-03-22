import { router, Stack } from 'expo-router';
import styled from 'styled-components/native';
import { ImageBackground } from 'react-native';
import { StaticImages } from '../assets/images/landing';
import Head from 'expo-router/head';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import TertiaryButton from '../components/TertiaryButton';

export default function Landing() {
  return (
    <Background source={StaticImages.landingBg} accessible={false}>
      <Head>
        <title>Welcome to Safinity!</title>
      </Head>
      <Stack.Screen options={{ title: 'Welcome to Safinity!', headerShown: false }} />

      <WelcomeTitle accessibilityRole="header" accessibilityHeadingLevel={1}>
        Welcome to Safinity!
      </WelcomeTitle>

      <Content accessibilityRole="main">
        <PrimaryButton
          accessibilityLabel="Log in"
          title="Log in"
          onPress={() => router.push('/login')}
        />

        <SecondaryButton
          accessibilityLabel="Create account"
          title="Create account"
          onPress={() => router.push('/register')}
        />

        <TertiaryButton title="Other options" onPress={() => console.log('Other options')} />
      </Content>
    </Background>
  );
}

// --------------------------------------------------------- Stuled Components ---------------------------------------------------------

const Background = styled(ImageBackground).attrs({
  imageStyle: {
    resizeMode: 'cover',
  },
})`
  flex: 1;
  width: 100%;
  justify-content: flex-end;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Content = styled.View`
  padding: ${({ theme }) => theme.spacing.margemLateral}px;
  gap: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const WelcomeTitle = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: 30px;
  text-align: center;
  font-weight: ${({ theme }) => theme.fonts.weights.extralight};
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;
