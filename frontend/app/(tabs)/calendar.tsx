import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // 1. Importar o router

import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { CalendarCard } from '../../components/CalendarCard';

import calendarData from '../../data/calendar.json';

// ... (teus styled components mantêm-se iguais)
const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ScrollContent = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
})<{ topInset: number }>`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.margemLateral}px;
  margin-top: ${({ topInset }) => topInset + 100}px;
`;

const EventSelector = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  padding: 15px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  margin-bottom: 25px;
`;

const SelectorLabel = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: 16px;
`;

const DateHeader = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: 14px;
  margin-top: 30px;
  margin-bottom: 15px;
  text-transform: capitalize;
`;

const MyCalendarButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 110px;
  align-self: center;
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 14px 30px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  elevation: 5;
  z-index: 10;
`;

const ButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-family: ${({ theme }) => theme.text.botao.fontFamily};
`;

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter(); // 2. Inicializar o router
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Stages');
  const categories = ['Stages', 'Workshops', 'Podcasts', 'Business'];

  const filteredActivities = calendarData.activities.filter(activity => {
    const matchesCategory = activity.category === selectedCategory;
    const matchesSearch = activity.title.toLowerCase().includes(searchValue.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Container>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Header />

      <ScrollContent topInset={insets.top}>
        <EventSelector activeOpacity={0.7}>
          <SelectorLabel>Web Summit 2025</SelectorLabel>
          <Ionicons name="chevron-down" size={20} color="white" />
        </EventSelector>

        <SearchInput
          value={searchValue}
          onChangeText={setSearchValue}
          variant="homepage"
          placeholder="Find your next activity"
        />

        <View style={{ marginTop: 0, marginHorizontal: -20 }}>
          <FilterTags
            tags={categories}
            selectedTags={[selectedCategory]}
            onTagPress={setSelectedCategory}
            variant="homepage"
          />
        </View>

        {filteredActivities.length > 0 ? (
          filteredActivities.map((item, index) => (
            <View key={item.id}>
              {(index === 0 || filteredActivities[index - 1].date !== item.date) && (
                <DateHeader>{item.date}</DateHeader>
              )}
              <CalendarCard item={item} />
            </View>
          ))
        ) : (
          <DateHeader style={{ textAlign: 'center', marginTop: 50 }}>
            No events found for &quot;{selectedCategory}&quot;
          </DateHeader>
        )}

        <View style={{ height: 180 }} />
      </ScrollContent>

      {/* 3. Adicionar o onPress para navegar para a nova página */}
      <MyCalendarButton activeOpacity={0.8} onPress={() => router.push('/(tabs)/my-calendar')}>
        <ButtonText>My calendar</ButtonText>
      </MyCalendarButton>
    </Container>
  );
}
