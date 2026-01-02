import { router } from 'expo-router';
import styled from 'styled-components/native';
import { ImageBackground } from 'react-native';
import bgImage from '../assets/images/landing-bg.jpg';

const Background = styled(ImageBackground)`
  flex: 1;
  width: 100%;
  height: 812px;
  justify-content: flex-end;
`;

const Content = styled.View`
  padding: 40px;
  gap: 25px;
  margin-bottom: 20px;
`;

const Button = styled.TouchableOpacity<{ secondary?: boolean }>`
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: ${({ secondary, theme }) => (secondary ? '#E9D9F5' : '#9242CC')};
`;

const ButtonText = styled.Text<{ secondary?: boolean }>`
  text-align: center;
  font-weight: 600;
  color: ${({ secondary }) => (secondary ? '#492166' : 'white')};
`;

const LinkText = styled.Text`
  text-align: center;
  color: white;
  text-decoration-line: underline;
  margin-top: 12px;
`;

export default function Landing() {
  return (
    <Background source={bgImage}>
      <Content>
        <Button onPress={() => router.push('./map')}>
          <ButtonText>Log in</ButtonText>
        </Button>

        <Button secondary onPress={() => router.push('/register')}>
          <ButtonText secondary>Create account</ButtonText>
        </Button>

        <LinkText>Other options</LinkText>
      </Content>
    </Background>
  );
}
