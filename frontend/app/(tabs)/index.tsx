import React, { useState } from 'react';
import { FlatList, StatusBar, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { useRouter, Stack } from 'expo-router';
import Head from 'expo-router/head';

import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { HeroBanner } from '../../components/HeroBanner';
import { EventCard } from '../../components/EventCard';
import eventsData from '../../data/events.json';

export default function HomeScreen() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Musical');

  const categories = ['Musical', 'Technology', 'Cultural', 'Educational'];

  const liveEvent = eventsData.events.find(e => e.status === 'live');
  const upcomingEvents = eventsData.events.filter(
    e => e.status === 'upcoming' && e.category.toLowerCase() === selectedCategory.toLowerCase(),
  );

  return (
    <Container>
      <Head>
        <title>Home | Safinity</title>
      </Head>
      <Stack.Screen options={{ title: 'Home | Safinity', headerShown: false }} />

      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Header />

      <Content>
        {liveEvent && <HeroBanner event={liveEvent} />}

        <PaddedContent>
          <SearchWrapper>
            <SearchInput value={searchValue} onChangeText={setSearchValue} variant="homepage" />
          </SearchWrapper>
        </PaddedContent>

        <FilterTags
          tags={categories}
          selectedTags={[selectedCategory]}
          onTagPress={setSelectedCategory}
          variant="homepage"
        />

        <PaddedContent>
          <SectionHeader>
            <SectionTitle>{selectedCategory} events</SectionTitle>
            <Pressable onPress={() => router.push('/events-list')}>
              <SeeMore>See more</SeeMore>
            </Pressable>
          </SectionHeader>
        </PaddedContent>

        <FlatList
          horizontal
          data={upcomingEvents}
          renderItem={({ item }) => <EventCard event={item} />}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: 40,
            paddingRight: 40,
            paddingBottom: 120,
          }}
          snapToInterval={280 + 16}
          decelerationRate="fast"
        />
      </Content>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Content = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  bounces: false,
})`
  flex: 1;
`;

const PaddedContent = styled.View`
  padding: 0 ${({ theme }) => theme.spacing.margemLateral}px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  /* Token: h */
  font-family: ${({ theme }) => theme.text.titulo.h.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h.fontSize}px;
`;

// 2. Ajustei o SeeMore para parecer um botão (adicionado padding para facilitar o toque)
const SeeMore = styled.Text`
  /* Token: corpo.corpoTexto */
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  line-height: ${({ theme }) => theme.text.corpo.corpoTexto.lineHeight}px;

  /* Cor e espaçamento */
  color: ${({ theme }) => theme.colors.primary_50};
  padding: 5px;
`;

const SearchWrapper = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;
