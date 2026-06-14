import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import { Stack, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, type ImageSourcePropType } from 'react-native';
import styled from 'styled-components/native';
import Camera from '../../../assets/Icons/camera.png';
import InputField from '../../../components/InputField';
import Header from '../../../components/ui/header';
import { Colors, Fonts } from '../../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { getMyProfile, updateMyProfile, type AuthenticatedProfile } from '../../../utils/profile';

function getProfileImageSource(image: string | null | undefined): ImageSourcePropType | null {
  if (!image || image === 'default' || image.includes('.')) {
    return null;
  }

  if (image.startsWith('data:image') || image.startsWith('http')) {
    return { uri: image };
  }

  return { uri: `data:image/jpeg;base64,${image}` };
}

function getApiErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return 'Failed to update profile';
  }

  const maybeError = error as {
    response?: {
      data?: {
        message?: string | string[];
      };
    };
  };
  const message = maybeError.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join('\n');
  }

  return message || 'Failed to update profile';
}

export default function EditProfile() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [user, setUser] = useState<AuthenticatedProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
  });
  const [profileImage, setProfileImage] = useState<ImageSourcePropType | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        setIsLoadingProfile(false);
        Alert.alert('Authentication required', 'Please sign in to edit your profile');
        router.replace('/landing');
        return;
      }

      try {
        setIsLoadingProfile(true);
        const token = await getTokenRef.current();
        const profile = await getMyProfile(token);

        if (!isActive) {
          return;
        }

        setUser(profile);
        setFormData({
          name: profile.name || '',
          username: profile.username || '',
        });
        setProfileImage(getProfileImageSource(profile.image));
      } catch (error) {
        console.error('Failed to load profile for editing', error);
        if (isActive) {
          Alert.alert('Error', 'Failed to load profile');
          router.back();
        }
      } finally {
        if (isActive) {
          setIsLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [isLoaded, isSignedIn]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const takePhoto = async () => {
    Alert.alert('Not available yet', 'Profile photo editing is not available yet');
  };

  const handleSave = async () => {
    const name = formData.name.trim();
    const username = formData.username.trim();

    if (!name || !username) {
      Alert.alert('Missing fields', 'Name and username are required');
      return;
    }

    try {
      setIsLoading(true);
      const token = await getTokenRef.current();
      await updateMyProfile(token, { name, username });

      setIsSuccessModalVisible(true);
    } catch (error) {
      console.error('Failed to update profile', error);
      Alert.alert('Error', getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile || !user) {
    return (
      <Container>
        <Header variant="back" title="Edit Profile" />
        <LoadingState>
          <ActivityIndicator color="white" />
          <LoadingText>Loading...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Stack.Screen options={{ title: 'Edit Profile' }} />
      <TopGradient
        colors={['rgba(190, 142, 224)', 'rgba(34, 39, 52, 0)']}
        locations={[0, 0.33]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 3.1 }}
      />

      <Header variant="back" title="Edit Profile" />

      <Modal
        visible={isSuccessModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSuccessModalVisible(false)}
        accessibilityViewIsModal
      >
        <ModalOverlay>
          <ModalContent role="alert">
            <SuccessIcon name="checkmark-circle" />
            <ModalTitle role="header">Changes saved</ModalTitle>
            <ModalDescription>Your profile has been updated successfully.</ModalDescription>

            <ModalButton
              onPress={() => {
                setIsSuccessModalVisible(false);
                router.replace('/perfil/profile');
              }}
              role="button"
              accessibilityLabel="Close success message"
            >
              <ModalButtonText>OK</ModalButtonText>
            </ModalButton>
          </ModalContent>
        </ModalOverlay>
      </Modal>

      <PaddedContent>
        <ProfileImageSection>
          <ProfileImageContainer>
            {profileImage ? (
              <ProfileImage
                source={profileImage}
                accessibilityLabel={`Current profile picture of ${user.name}`}
              />
            ) : (
              <DefaultImagePlaceholder
                accessible={true}
                accessibilityLabel="No profile picture set"
              >
                <DefaultAvatarIcon accessible={false} />
              </DefaultImagePlaceholder>
            )}

            <CameraButton
              onPress={takePhoto}
              role="button"
              accessibilityLabel="Take a new profile photo"
            >
              <EditImage source={Camera} accessible={false} />
            </CameraButton>
          </ProfileImageContainer>
        </ProfileImageSection>

        <FormSection>
          <InputField
            label="Edit name"
            icon="person-outline"
            value={formData.name}
            onChangeText={(value: string) => handleChange('name', value)}
          />

          <InputField
            label="Edit username"
            icon="at-outline"
            value={formData.username}
            onChangeText={(value: string) => handleChange('username', value)}
          />

          <SaveButton
            onPress={handleSave}
            disabled={isLoading}
            role="button"
            accessibilityLabel={isLoading ? 'Saving changes, please wait' : 'Save changes'}
            accessibilityState={{ disabled: isLoading }}
          >
            {isLoading ? <ButtonText>Saving...</ButtonText> : <ButtonText>Save Changes</ButtonText>}
          </SaveButton>
        </FormSection>
      </PaddedContent>
    </Container>
  );
}

const EditImage = styled.Image`
  width: 24px;
  height: 22px;
`;
const TopGradient = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  z-index: 0;
`;

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LoadingState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const PaddedContent = styled.View`
  padding: 20px ${({ theme }) => theme.spacing.margemLateral}px;
  padding-top: 100px;
`;

const ProfileImageSection = styled.View`
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
`;

const ProfileImageContainer = styled.View`
  align-items: center;
  position: relative;
`;

const ProfileImage = styled.Image`
  width: 250px;
  height: 250px;
  border-radius: 125px;
  margin-bottom: 20px;
`;

const DefaultImagePlaceholder = styled.View`
  width: 250px;
  height: 250px;
  border-radius: 125px;
  background-color: ${({ theme }) => theme.colors.background};
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const DefaultAvatarIcon = styled(Ionicons).attrs({
  name: 'person',
  size: 72,
})`
  color: ${({ theme }) => theme.colors.palette.neutral.neutral80};
`;

const CameraButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 40px;
  right: 0;
  background-color: ${Colors.palette.primary.light90};
  width: 50px;
  height: 50px;
  border-radius: 25px;
  align-items: center;
  justify-content: center;
`;

const FormSection = styled.View``;

const SaveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  height: 48px;
  width: 202px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  padding: 10px 20px;
  margin: 24px 0;
  align-self: center;
`;

const ButtonText = styled.Text`
  color: ${Colors.white};
  font-size: 16px;
  font-family: ${Fonts.weights.medium};
`;

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.72);
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.margemLateral}px;
`;

const ModalContent = styled.View`
  width: 100%;
  max-width: 340px;
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  align-items: center;
`;

const SuccessIcon = styled(Ionicons).attrs({
  size: 54,
})`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const ModalTitle = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h1.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h1.fontSize}px;
  text-align: center;
`;

const ModalDescription = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const ModalButton = styled.TouchableOpacity`
  height: 48px;
  min-width: 140px;
  padding: 0 ${({ theme }) => theme.spacing.xl}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
`;

const ModalButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${Fonts.weights.medium};
  font-size: 16px;
`;
