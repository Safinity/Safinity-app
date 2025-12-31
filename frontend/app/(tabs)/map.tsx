import { Pressable } from 'react-native';
import { router } from 'expo-router';
import styled from 'styled-components/native';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Content = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #FFFFFF;
`;

const Button = styled(Pressable)`
  background-color: #007AFF;
  padding-horizontal: 16px;
  padding-vertical: 10px;
  border-radius: 8px;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-weight: 600;
`;

export default function MapScreen() {
  return (
    <Container>
      <Content>
        <Title>Map Screen</Title>
        <Button onPress={() => router.push('/teste-not-found')}>
          <ButtonText>Ir para página inexistente</ButtonText>
        </Button>
      </Content>
    </Container>
  );
}