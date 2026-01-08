// app/(tabs)/perfil/edit-profile.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import Camera from '../../../assets/Icons/camera.png';
import { userImages } from '../../../assets/images/Users/userImages';
import InputField from '../../../components/InputField';
import Header from '../../../components/ui/header';
import { Colors, Fonts } from '../../../constants/theme';
import auth from '../../../data/auth.json';
import users from '../../../data/users.json';
import { LinearGradient } from 'expo-linear-gradient';

export default function EditProfile() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
  });
  const [profileImage, setProfileImage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentId = auth.currentUserId;
    const foundUser = users.find(u => u.id === currentId);
    setUser(foundUser);

    if (foundUser) {
      setFormData({
        name: foundUser.name || '',
        username: foundUser.username || '',
      });

      const imageFileName = foundUser.image;
      const userImage = userImages[imageFileName] || userImages['default'];
      setProfileImage(userImage);
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage({ uri: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSave = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    }, 1500);
  };

  if (!user) {
    return null;
  }

  return (
    <Container>
      <TopGradient
        colors={['rgba(190, 142, 224)', 'rgba(34, 39, 52, 0)']}
        locations={[0, 0.33]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 3.1 }}
      />

      <Header variant="back" title="Edit Profile" />

      <PaddedContent>
        <ProfileImageSection>
          <ProfileImageContainer>
            {profileImage ? (
              <ProfileImage source={profileImage} />
            ) : (
              <DefaultImagePlaceholder>
                <Ionicons name="person" size={80} color={Colors.white} />
              </DefaultImagePlaceholder>
            )}

            <CameraButton onPress={takePhoto}>
              <EditImage source={Camera} />
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

          <SaveButton onPress={handleSave} disabled={isLoading}>
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
  background-color: ${Colors.palette.primary.normal};
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
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
