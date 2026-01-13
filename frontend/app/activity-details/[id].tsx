import React from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

// Componentes e Dados
import { HeroBanner } from '../../components/HeroBanner';
import calendarData from '../../data/calendar.json';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BackButton = styled.Pressable`
  position: absolute;
  top: 50px;
  left: 20px;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.5);
  width: 44px;
  height: 44px;
  border-radius: 22px;
  justify-content: center;
  align-items: center;
  elevation: 10;
`;

const ContentCard = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 25px;
  padding-top: 0px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  font-size: 18px;
  margin-top: 25px;
  margin-bottom: 10px;
  font-weight: bold;
`;

const DescriptionText = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: 16px;
  line-height: 24px;
`;

const RouteCard = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  flex-direction: row;
  align-items: center;
  padding: 18px;
  border-radius: 20px;
  margin-top: 25px;
`;

const RouteInfo = styled.View`
  margin-left: 15px;
`;

const RouteTitle = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: 16px;
  font-weight: bold;
`;

const FeaturingSection = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 15px;
`;

const AvatarStack = styled.View`
  flex-direction: row;
  margin-right: 15px;
`;

const Avatar = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.background};
  margin-right: -15px;
`;

export default function ActivityDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Procura a atividade no JSON
  const activity = calendarData.activities.find(item => item.id === id);

  if (!activity) return null;

  const handleBack = () => {
    router.push('/(tabs)/calendar');
  };

  return (
    <Container>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <HeroBanner event={activity} isDetail={true} />

        <ContentCard>
          <SectionTitle>Description</SectionTitle>
          <DescriptionText>{activity.description || 'No description available.'}</DescriptionText>

          <RouteCard activeOpacity={0.8}>
            <View
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12 }}
            >
              <Ionicons name="location" size={24} color="white" />
            </View>
            <RouteInfo>
              <RouteTitle>{activity.location}</RouteTitle>
              <DescriptionText style={{ fontSize: 14 }}>View route</DescriptionText>
            </RouteInfo>
          </RouteCard>

          <SectionTitle>Featuring</SectionTitle>
          <FeaturingSection>
            {activity.featuring && activity.featuring.length > 0 ? (
              <>
                <AvatarStack>
                  {activity.featuring.slice(0, 3).map((person, index) => (
                    <Avatar
                      key={index}
                      source={{ uri: `https://i.pravatar.cc/100?u=${encodeURIComponent(person)}` }}
                    />
                  ))}
                </AvatarStack>
                <DescriptionText style={{ flex: 1, marginLeft: 10 }}>
                  {activity.featuring.join(', ')}
                </DescriptionText>
              </>
            ) : (
              <DescriptionText>To Be Announced</DescriptionText>
            )}
          </FeaturingSection>

          <View style={{ height: 100 }} />
        </ContentCard>
      </ScrollView>

      <BackButton onPress={handleBack}>
        <Ionicons name="chevron-back" size={28} color="white" />
      </BackButton>
    </Container>
  );
}
