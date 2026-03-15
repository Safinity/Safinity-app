import { Stack } from 'expo-router';
import styled from 'styled-components/native';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;


export default function PerfilLayout() {
  return (
    <Container>
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
    </Stack>
    </Container>
  );
}
