import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import Head from 'expo-router/head';
import Header from '../components/ui/header';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ToggleContainer = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  height: ${({ theme }) => theme.height.sm}px;
  margin-top: ${({ theme }) => theme.spacing.xxxl}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  position: relative;
  overflow: hidden;
  margin-left: ${({ theme }) => theme.spacing.margemLateral}px;
  margin-right: ${({ theme }) => theme.spacing.margemLateral}px;
`;

const Slider = styled(Animated.View)`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50.5%;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
`;

const TabButton = styled(TouchableOpacity)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const TabText = styled.Text<{ active: boolean }>`
  color: ${({ active, theme }) => (active ? theme.colors.white : theme.colors.background)};
  ${({ theme }) => theme.text.botao};
`;

const CameraWrapper = styled.View`
  flex: 1;
  border-radius: ${({ theme }) => theme.borderRadius.xlarge}px;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const QRCodeContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl}px;
`;

const HelperText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  ${({ theme }) => theme.text.corpo.corpoTexto};
  opacity: 0.8;
  text-align: center;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.titulo.h3};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export default function QRCodeScreen() {
  const [mode, setMode] = useState<'scan' | 'my'>('scan');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  const slideAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    requestPermission();
  }, []);

  const handleToggle = (newMode: 'scan' | 'my') => {
    setMode(newMode);
    Animated.spring(slideAnim, {
      toValue: newMode === 'scan' ? 0 : 1,
      useNativeDriver: false,
    }).start();
  };

  const sliderTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    alert(`Amigo encontrado: ${data}`);
    setTimeout(() => setScanned(false), 3000);
  };

  return (
    <Container>
      <Head>
        <title>QR Code | Safinity</title>
      </Head>

      <Stack.Screen options={{ title: 'QR Code | Safinity', headerShown: false }} />

      <View role="banner">
        <Header variant="back" title="Profile’s QR Code" />
      </View>

      <View role="main">
        <ToggleContainer role="region" accessibilityLabel="QR Code mode selector">
          <Slider style={{ transform: [{ translateX: sliderTranslate }] }} />

          <TabButton
            onPress={() => handleToggle('scan')}
            accessible={true}
            role="button"
            accessibilityLabel="Scan QR Code"
            accessibilityState={{ selected: mode === 'scan' }}
          >
            <TabText active={mode === 'scan'}>Scan QR Code</TabText>
          </TabButton>

          <TabButton
            onPress={() => handleToggle('my')}
            accessible={true}
            role="button"
            accessibilityLabel="Show my QR Code"
            accessibilityState={{ selected: mode === 'my' }}
          >
            <TabText active={mode === 'my'}>My QR Code</TabText>
          </TabButton>
        </ToggleContainer>

        {mode === 'scan' ? (
          <View role="region" accessibilityLabel="QR code scanner">
            <CameraWrapper>
              <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              />
              <View style={styles.overlay}>
                <Ionicons
                  name="scan-outline"
                  size={300}
                  color="white"
                  style={{ opacity: 0.9 }}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              </View>
            </CameraWrapper>
          </View>
        ) : (
          <View role="region" accessibilityLabel="My QR code">
            <QRCodeContainer>
              <Ionicons
                name="qr-code-outline"
                size={260}
                color="white"
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <HelperText>Share your QR Code with friends</HelperText>
            </QRCodeContainer>
          </View>
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
