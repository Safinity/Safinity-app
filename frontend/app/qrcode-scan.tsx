import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- Styled Components ---
const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 60px 30px 20px;
`;

const Header = styled.View`
  margin-bottom: 30px;
`;

const BackButton = styled.TouchableOpacity`
  margin-bottom: 20px;
  width: 40px;
`;

// Alterado para usar a tipografia 'h' do teu tema
const Title = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h1.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h1.fontSize}px;
  font-weight: bold;
`;

const ToggleContainer = styled.View`
  flex-direction: row;
  background-color: #ffffff;
  border-radius: 14px;
  padding: 6px;
  margin-bottom: 40px;
`;

const TabButton = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  align-items: center;
  background-color: ${({ active, theme }) => (active ? theme.colors.primary : 'transparent')};
`;

const TabText = styled.Text<{ active: boolean }>`
  color: ${({ active, theme }) => (active ? '#FFFFFF' : theme.colors.background)};
  font-weight: 600;
  font-size: 16px;
`;

const CameraWrapper = styled.View`
  flex: 1;
  border-radius: 30px;
  overflow: hidden;
  margin-bottom: 40px;
  background-color: #000;
`;

const QRCodeContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default function QRCodeScreen() {
  const [mode, setMode] = useState<'scan' | 'my'>('scan');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    requestPermission();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    alert(`Amigo encontrado: ${data}`);
    setTimeout(() => setScanned(false), 3000);
  };

  return (
    <Container>
      <Header>
        <BackButton onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </BackButton>
        <Title>Profile&apos;s QR Code</Title>
      </Header>

      <ToggleContainer>
        <TabButton active={mode === 'scan'} onPress={() => setMode('scan')}>
          <TabText active={mode === 'scan'}>Scan QR Code</TabText>
        </TabButton>
        <TabButton active={mode === 'my'} onPress={() => setMode('my')}>
          <TabText active={mode === 'my'}>My QR Code</TabText>
        </TabButton>
      </ToggleContainer>

      {mode === 'scan' ? (
        <CameraWrapper>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
          <View style={styles.overlay}>
            <Ionicons name="scan-outline" size={320} color="white" style={{ opacity: 0.9 }} />
          </View>
        </CameraWrapper>
      ) : (
        <QRCodeContainer>
          <Ionicons name="qr-code-outline" size={300} color="white" />

          <Text
            style={{
              color: 'white',
              marginTop: 30,
              fontSize: 18,
              opacity: 0.8,
              textAlign: 'center',
            }}
          >
            Share your QR Code with friends
          </Text>
        </QRCodeContainer>
      )}
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
