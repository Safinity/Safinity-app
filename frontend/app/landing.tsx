import { router } from 'expo-router';
import styled from 'styled-components/native';
import { ImageBackground } from 'react-native';
import bgImage from '../assets/images/landing-bg.jpg';

import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import TertiaryButton from '../components/TertiaryButton';

const Background = styled(ImageBackground)`
  flex: 1;
  width: 100%;
  height: 812px;
  justify-content: flex-end;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Content = styled.View`
  padding: 40px;
  gap: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export default function Landing() {
  return (
    <Background source={bgImage}>
      <Content>
        <PrimaryButton title="Log in" onPress={() => router.push('./map')} />

        <SecondaryButton title="Create account" onPress={() => router.push('/register')} />

        <TertiaryButton title="Other options" onPress={() => console.log('Other options')} />
      </Content>
    </Background>
  );
}
