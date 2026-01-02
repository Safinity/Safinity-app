import { useEffect, useRef } from 'react';
import styled from 'styled-components/native';
import { Animated } from 'react-native';
import { router } from 'expo-router';
import Logo from '../assets/logos/loading-logo.png';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  justify-content: center;
  align-items: center;
`;

export default function LoadingScreen() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    const t = setTimeout(() => router.replace('/landing'), 2000);

    return () => clearTimeout(t);
  }, [opacity]);

  return (
    <Container>
      <Animated.Image
        source={Logo}
        style={{
          width: '80%',
          aspectRatio: 1,
          opacity,
        }}
        resizeMode="contain"
      />
    </Container>
  );
}
