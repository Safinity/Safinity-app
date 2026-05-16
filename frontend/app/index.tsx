import { useEffect, useRef } from 'react';
import styled from 'styled-components/native';
import { Animated } from 'react-native';
import { router, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useAuth } from '@clerk/expo';

const Logo = require('../assets/logos/loading-logo.png');

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  justify-content: center;
  align-items: center;
`;

export default function LoadingScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    if (!isLoaded) return;

    const t = setTimeout(() => {
      router.replace(isSignedIn ? '/(tabs)' : '/landing');
    }, 1200);

    return () => clearTimeout(t);
  }, [isLoaded, isSignedIn, opacity]);

  return (
    <Container>
      <Head>
        <title>Entering Safinity...</title>
      </Head>
      <Stack.Screen options={{ title: 'Entering Safinity...', headerShown: false }} />

      <Animated.Image
        source={Logo}
        style={{
          height: 140,
          aspectRatio: 1,
          opacity,
        }}
        resizeMode="contain"
      />
    </Container>
  );
}
