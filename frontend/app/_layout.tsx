// app/_layout.tsx
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import styled, { ThemeProvider } from 'styled-components/native';
import { theme } from '../constants/theme';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export default function RootLayout() {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Slot />
      </Container>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
