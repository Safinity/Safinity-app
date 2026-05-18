import React, { useEffect, useState } from 'react';
import { View, StatusBar, Platform, ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import Head from 'expo-router/head';

import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { CalendarCard } from '../../components/CalendarCard';
import api from '../../utils/api'; // Reativado o teu cliente de API

// --- Imports estáticos de imagens para o mapeamento local ---
import img1 from '../../assets/images/Calendar/1.jpg';
import img2 from '../../assets/images/Calendar/2.jpg';
import img3 from '../../assets/images/Calendar/3.jpg';
import img4 from '../../assets/images/Calendar/4.jpg';
import img5 from '../../assets/images/Calendar/5.jpg';
import img6 from '../../assets/images/Calendar/6.jpg';
import img7 from '../../assets/images/Calendar/7.jpg';
import img8 from '../../assets/images/Calendar/8.jpg';
import img9 from '../../assets/images/Calendar/9.jpg';
import img14 from '../../assets/images/Calendar/14.jpg';

const localImages: { [key: string]: any } = {
  "1.jpg": img1,
  "2.jpg": img2,
  "3.jpg": img3,
  "4.jpg": img4,
  "5.jpg": img5,
  "6.jpg": img6,
  "7.jpg": img7,
  "8.jpg": img8,
  "9.jpg": img9,
  "14.jpg": img14,
};

// --- Styled Components ---
const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ScrollContent = styled(ScrollView).attrs({
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.margemLateral}px;
  padding-bottom: ${({ theme }) => theme.spacing.xxl}px;
`;

const EventSelector = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  padding-vertical: ${({ theme }) => theme.spacing.md}px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const SelectorLabel = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
`;

const DateHeader = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.textoPequeno.fontSize}px;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  text-transform: capitalize;
`;

const MyCalendarButton = styled.TouchableOpacity`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.xxl}px;
  align-self: center;
  background-color: ${({ theme }) => theme.colors.primary};
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  elevation: 5;
  z-index: 10;
`;

const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.botao.fontFamily};
  font-size: ${({ theme }) => theme.text.botao.fontSize}px;
  line-height: 20px;
`;

const HeaderWrapper = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 20;
`;

const SpaceBottom = styled.View`
  height: 90px;
`;

export default function CalendarScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Stages');
  const [presentEvent, setPresentEvent] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Stages', 'Workshops', 'Podcasts', 'Business'];

  useEffect(() => {
    const loadActivities = async () => {
      try {
        // Restaurada a tua rota dinâmica original para ir buscar o evento atualizado
        const eventResponse = await api.get('/events/present-event');
        const event = eventResponse.data;
        setPresentEvent(event);

        if (event?.id) {
          // Procura as atividades associadas dinamicamente ao ID do evento retornado
          const activitiesResponse = await api.get(`/events/${event.id}/activities`);
          const data = Array.isArray(activitiesResponse.data)
            ? activitiesResponse.data
            : activitiesResponse.data?.results || [];
          
          setActivities(data);
        }
      } catch (error) {
        console.error('Erro ao buscar evento e atividades:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesCategory = activity.category === selectedCategory;
    const matchesSearch = activity.title?.toLowerCase().includes(searchValue.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Container>
      <Head>
        <title>Activities | Safinity</title>
      </Head>

      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <HeaderWrapper 
        style={{ paddingTop: Platform.OS === 'web' ? 15 : insets.top }} 
        accessibilityRole="header"
      >
        <Header />
      </HeaderWrapper>

      <ScrollContent 
        accessibilityRole="main" 
        accessibilityLabel="Calendar events"
        contentContainerStyle={{ paddingTop: 10 }}
      >
        <EventSelector
          activeOpacity={0.7}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Select event"
        >
          <SelectorLabel>{presentEvent?.name ?? 'Atual Event'}</SelectorLabel>
          <Ionicons name="chevron-down" size={20} color="white" />
        </EventSelector>

        <SearchInput
          value={searchValue}
          onChangeText={setSearchValue}
          variant="homepage"
          placeholder="Find your next activity"
        />

        <View
          style={{ marginHorizontal: -theme.spacing.margemLateral }}
          accessibilityRole="navigation"
        >
          <FilterTags
            tags={categories}
            selectedTags={[selectedCategory]}
            onTagPress={setSelectedCategory}
            variant="homepage"
          />
        </View>

        {!loading && filteredActivities.length > 0 ? (
          filteredActivities.map((item, index) => {
            let resolvedImage;

            // Interceta strings locais ("1.jpg", etc) vindas da base de dados e injeta o import estático
            if (item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'))) {
              resolvedImage = { uri: item.image };
            } else if (localImages[item.image]) {
              resolvedImage = localImages[item.image];
            } else {
              resolvedImage = img1; // Fallback seguro caso falte a propriedade
            }

            const activityWithImage = { ...item, image: resolvedImage };

            return (
              <View key={item.id}>
                {(index === 0 || filteredActivities[index - 1].date !== item.date) && (
                  <DateHeader>{item.date}</DateHeader>
                )}

                <View style={{ marginBottom: 15 }}>
                  <CalendarCard item={activityWithImage} />
                </View>
              </View>
            );
          })
        ) : (
          !loading && (
            <DateHeader style={{ textAlign: 'center', marginTop: 50 }}>
              No events found
            </DateHeader>
          )
        )}

        <SpaceBottom />
      </ScrollContent>

      <MyCalendarButton
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/my-calendar')}
      >
        <ButtonText>My calendar</ButtonText>
      </MyCalendarButton>
    </Container>
  );
}