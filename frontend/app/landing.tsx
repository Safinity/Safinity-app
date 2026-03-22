import { router, Stack } from 'expo-router';
import styled from 'styled-components/native';
import { ImageBackground } from 'react-native';
import { StaticImages } from '../assets/images/landing';
import Head from 'expo-router/head';

import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import TertiaryButton from '../components/TertiaryButton';

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

export default function Landing() {
  return (
    <Background source={StaticImages.landingBg}>
      <Content>
        <Head>
          <title>Welcome to Safinity!</title>
        </Head>
        <Stack.Screen options={{ title: 'Welcome to Safinity!', headerShown: false }} />

        <PrimaryButton title="Log in" onPress={() => router.push('/login')} />

        <SecondaryButton title="Create account" onPress={() => router.push('/register')} />

        <TertiaryButton title="Other options" onPress={() => console.log('Other options')} />
      </Content>
    </Background>
  );
}
