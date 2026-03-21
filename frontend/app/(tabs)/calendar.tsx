import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import Head from 'expo-router/head';

import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { CalendarCard } from '../../components/CalendarCard';
import calendarData from '../../data/calendar.json';
import { useTheme } from 'styled-components/native';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ScrollContent = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.margemLateral}px;
  padding-top: ${({ theme }) => theme.spacing.md}px;
  padding-bottom: ${({ theme }) => theme.spacing.xxl}px;
`;

const Spacer = styled.View`
  height: ${({ theme }) => theme.spacing.xl}px;
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
  line-height: ${({ theme }) => theme.text.botao.lineHeight}px;
`;

const HeaderWrapper = styled.View<{ topInset: number }>`
  padding-top: ${({ topInset }) => topInset}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const SpaceBottom = styled.View<{ topInset: number }>`
  height: ${({ theme }) => theme.height.bottomMargem}px;
`;

export default function CalendarScreen() {
  const theme = useTheme();

  const insets = useSafeAreaInsets();
  const router = useRouter();
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
      <Head>
        <title>Calendar | Safinity</title>
      </Head>
      <Stack.Screen options={{ title: 'Calendar | Safinity', headerShown: false }} />

      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <HeaderWrapper topInset={insets.top}>
        <Header />
      </HeaderWrapper>

      <ScrollContent>
        <Spacer />

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

        <View
          style={{
            marginTop: 0,
            marginHorizontal: -theme.spacing.margemLateral,
          }}
        >
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
          <DateHeader style={{ textAlign: 'center', marginTop: 50 }}>No events found</DateHeader>
        )}

        <SpaceBottom />
      </ScrollContent>

      <MyCalendarButton activeOpacity={0.8} onPress={() => router.push('/(tabs)/my-calendar')}>
        <ButtonText>My calendar</ButtonText>
      </MyCalendarButton>
    </Container>
  );
}
