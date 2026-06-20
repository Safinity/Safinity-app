import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  View,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useAuth } from '@clerk/expo';
import QRCode from 'qrcode';
import { SvgXml } from 'react-native-svg';
import Header from '../components/ui/header';
import { useUser } from '@/context/UserContext';
import {
  addFriendFromQrPayload,
  getMyFriendQrCode,
  previewFriendFromQrPayload,
  type AddFriendQrResponse,
  type FriendQrResponse,
} from '@/utils/friends';
import { getUserImageUri } from '@/utils/userImages';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MainContent = styled.View`
  flex: 1;
`;

const ToggleContainer = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  height: ${({ theme }) => theme.height.sm}px;
  margin-top: ${({ theme }) => theme.spacing.xxxl}px;
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
  margin-horizontal: ${({ theme }) => theme.spacing.margemLateral}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ScannerRegion = styled.View`
  flex: 1;
`;

const QRCodeContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  padding-horizontal: ${({ theme }) => theme.spacing.margemLateral}px;
`;

const HelperText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  ${({ theme }) => theme.text.corpo.corpoTexto};
  opacity: 0.8;
  text-align: center;
`;

const QRCard = styled.View`
  width: 300px;
  height: 300px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: ${({ theme }) => theme.colors.white};
  justify-content: center;
  align-items: center;
`;

const ProfileName = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.titulo.h3};
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  text-align: center;
`;

const ProfileUsername = styled.Text`
  color: ${({ theme }) => theme.colors.palette.neutral.neutral70};
  ${({ theme }) => theme.text.textoPequeno};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  text-align: center;
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.text.corpo.corpoTexto};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;

const PermissionButton = styled.TouchableOpacity`
  min-height: 48px;
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  background-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;

const PermissionButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.botao};
`;

const ModalBackdrop = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-horizontal: ${({ theme }) => theme.spacing.margemLateral}px;
  background-color: rgba(0, 0, 0, 0.55);
`;

const ConfirmCard = styled.View`
  width: 100%;
  max-width: 340px;
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xl}px;
  align-items: center;
`;

const FriendAvatar = styled.Image`
  width: 96px;
  height: 96px;
  border-radius: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const AvatarFallback = styled.View`
  width: 96px;
  height: 96px;
  border-radius: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
`;

const ConfirmName = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.titulo.h3};
  text-align: center;
`;

const ConfirmUsername = styled.Text`
  color: ${({ theme }) => theme.colors.palette.neutral.neutral70};
  ${({ theme }) => theme.text.textoPequeno};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  text-align: center;
`;

const ConfirmText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.corpo.corpoTexto};
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  text-align: center;
`;

const ConfirmActions = styled.View`
  width: 100%;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
`;

const ConfirmButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  min-height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme, variant }) =>
    variant === 'primary' ? theme.colors.primary : theme.colors.white};
`;

const ConfirmButtonText = styled.Text<{ variant?: 'primary' | 'secondary' }>`
  color: ${({ theme, variant }) =>
    variant === 'primary' ? theme.colors.white : theme.colors.background};
  ${({ theme }) => theme.text.botao};
`;

export default function QRCodeScreen() {
  const [mode, setMode] = useState<'scan' | 'my'>('scan');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrSvg, setQrSvg] = useState('');
  const [qrData, setQrData] = useState<FriendQrResponse | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [qrError, setQrError] = useState('');
  const [pendingPayload, setPendingPayload] = useState('');
  const [pendingFriend, setPendingFriend] = useState<AddFriendQrResponse['friend'] | null>(null);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { addFriend } = useUser();

  const slideAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    void requestPermission();
  }, [requestPermission]);

  const loadMyQrCode = useCallback(async () => {
    setQrError('');
    setIsLoadingQr(true);

    try {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        throw new Error('Authentication required');
      }

      const token = await getToken();
      const response = await getMyFriendQrCode(token);
      const svg = await QRCode.toString(response.payload, {
        type: 'svg',
        width: 260,
        margin: 2,
        color: {
          dark: '#222734',
          light: '#FFFFFF',
        },
      });

      setQrData(response);
      setQrSvg(svg);
    } catch (error: any) {
      setQrError(error.response?.data?.message || error.message || 'Unable to load your QR code');
    } finally {
      setIsLoadingQr(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    if (mode === 'my' && isLoaded && !qrSvg && !isLoadingQr) {
      void loadMyQrCode();
    }
  }, [isLoaded, isLoadingQr, loadMyQrCode, mode, qrSvg]);

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

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);

    try {
      if (!isLoaded || !isSignedIn) {
        throw new Error('Authentication required');
      }

      const token = await getToken();
      const response = await previewFriendFromQrPayload(token, data);
      setPendingPayload(data);
      setPendingFriend(response.friend);
    } catch (error: any) {
      Alert.alert(
        'Unable to add friend',
        error.response?.data?.message || error.message || 'Please try again.',
      );
      setTimeout(() => setScanned(false), 1500);
    }
  };

  const closeAddFriendModal = () => {
    if (isAddingFriend) return;

    setPendingPayload('');
    setPendingFriend(null);
    setScanned(false);
  };

  const confirmAddFriend = async () => {
    if (!pendingPayload || !pendingFriend) return;

    setIsAddingFriend(true);

    try {
      const token = await getToken();
      const response = await addFriendFromQrPayload(token, pendingPayload);
      addFriend(response.friend.id);
      setPendingPayload('');
      setPendingFriend(null);
      Alert.alert(
        'Friend added',
        `${response.friend.name || response.friend.username || 'Friend'} is now your friend.`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (error: any) {
      Alert.alert(
        'Unable to add friend',
        error.response?.data?.message || error.message || 'Please try again.',
      );
      setScanned(false);
    } finally {
      setIsAddingFriend(false);
    }
  };

  const pendingFriendImage = getUserImageUri(pendingFriend?.image);

  return (
    <Container>
      <Head>
        <title>QR Code | Safinity</title>
      </Head>

      <Stack.Screen options={{ title: 'QR Code | Safinity', headerShown: false }} />

      <Modal
        visible={!!pendingFriend}
        transparent
        animationType="fade"
        onRequestClose={closeAddFriendModal}
      >
        <ModalBackdrop>
          <ConfirmCard>
            {pendingFriendImage ? (
              <FriendAvatar source={{ uri: pendingFriendImage }} resizeMode="cover" />
            ) : (
              <AvatarFallback>
                <Ionicons
                  name="person-outline"
                  size={44}
                  color="white"
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              </AvatarFallback>
            )}

            <ConfirmName>{pendingFriend?.name || 'Safinity user'}</ConfirmName>
            {pendingFriend?.username ? (
              <ConfirmUsername>@{pendingFriend.username}</ConfirmUsername>
            ) : null}

            <ConfirmText>Are you sure you want to add this friend?</ConfirmText>

            <ConfirmActions>
              <ConfirmButton
                variant="secondary"
                onPress={closeAddFriendModal}
                disabled={isAddingFriend}
                role="button"
                accessibilityLabel="Cancel adding friend"
              >
                <ConfirmButtonText variant="secondary">Cancel</ConfirmButtonText>
              </ConfirmButton>

              <ConfirmButton
                variant="primary"
                onPress={confirmAddFriend}
                disabled={isAddingFriend}
                role="button"
                accessibilityLabel="Add friend"
              >
                {isAddingFriend ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <ConfirmButtonText variant="primary">Add</ConfirmButtonText>
                )}
              </ConfirmButton>
            </ConfirmActions>
          </ConfirmCard>
        </ModalBackdrop>
      </Modal>

      <View role="banner">
        <Header variant="back" title="Profile’s QR Code" />
      </View>

      <MainContent role="main">
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
          <ScannerRegion role="region" accessibilityLabel="QR code scanner">
            <CameraWrapper>
              {!permission ? (
                <QRCodeContainer>
                  <ActivityIndicator size="large" color="white" />
                  <HelperText>Preparing camera</HelperText>
                </QRCodeContainer>
              ) : permission.granted ? (
                <>
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
                </>
              ) : (
                <QRCodeContainer>
                  <Ionicons
                    name="camera-outline"
                    size={64}
                    color="white"
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  />
                  <HelperText>Camera permission is required to scan QR codes</HelperText>
                  {permission.canAskAgain ? (
                    <PermissionButton
                      onPress={requestPermission}
                      role="button"
                      accessibilityLabel="Allow camera access"
                    >
                      <PermissionButtonText>Allow camera access</PermissionButtonText>
                    </PermissionButton>
                  ) : (
                    <ErrorText role="alert">
                      Enable camera access for Expo Go in iPhone Settings.
                    </ErrorText>
                  )}
                </QRCodeContainer>
              )}
            </CameraWrapper>
          </ScannerRegion>
        ) : (
          <ScannerRegion role="region" accessibilityLabel="My QR code">
            <QRCodeContainer>
              <QRCard>
                {isLoadingQr ? (
                  <ActivityIndicator size="large" color="#222734" />
                ) : qrSvg ? (
                  <SvgXml xml={qrSvg} width={260} height={260} />
                ) : (
                  <Ionicons
                    name="qr-code-outline"
                    size={180}
                    color="#222734"
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  />
                )}
              </QRCard>

              {qrData ? (
                <>
                  <ProfileName>{qrData.user.name || 'Safinity user'}</ProfileName>
                  <ProfileUsername>@{qrData.user.username || qrData.user.id}</ProfileUsername>
                </>
              ) : null}

              {qrError ? (
                <ErrorText role="alert">{qrError}</ErrorText>
              ) : (
                <HelperText>Share your QR Code with friends</HelperText>
              )}

              <RefreshButton
                onPress={loadMyQrCode}
                role="button"
                accessibilityLabel="Refresh my QR code"
              >
                <Ionicons
                  name="refresh-outline"
                  size={22}
                  color="white"
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              </RefreshButton>
            </QRCodeContainer>
          </ScannerRegion>
        )}
      </MainContent>
    </Container>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});

const RefreshButton = styled.TouchableOpacity`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  background-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;
