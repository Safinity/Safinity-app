// app/not-found.tsx
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import styled from 'styled-components/native';
import { GradientText } from '../components/ui/GradientText';

// Componentes estilizados com tema
const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 24px;
  justify-content: space-between;
`;

const Content = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
`;

const Message = styled.Text`
  font-size: 16px;
  color: #c9ccd6;
  text-align: center;
  margin-bottom: 32px;
`;

const Button = styled(Pressable)`
  background-color: #8a4ccf;
  padding-vertical: 16px;
  border-radius: 20px;
  align-items: center;
  margin-bottom: 60px;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

export default function NotFound() {
  return (
    <Container>
      <Content>
        <Title>Opss!</Title>
        <Message>Unable to find the location{'\n'}of this page</Message>
        <GradientText text="404" style={styles.errorCode} />
      </Content>
      <Button onPress={() => router.replace('./map')}>
        <ButtonText>Return to Home</ButtonText>
      </Button>
    </Container>
  );
}

// Mantenha apenas o estilo que não pode ser convertido (GradientText)
const styles = {
  errorCode: {
    fontSize: 164,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
};
