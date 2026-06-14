import React, { useEffect, useState } from 'react';
import { FlatList, StatusBar, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { useRouter, Stack } from 'expo-router';
import Head from 'expo-router/head';
import api from '../../utils/api';

interface Event {
  id: string;
  name: string;
  status: 'live' | 'upcoming' | 'past';
  category: string;
  image?: string;
  [key: string]: any;
}

import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { HeroBanner } from '../../components/HeroBanner';
import { EventCard } from '../../components/EventCard';

export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Music');

  const categories = ['Music', 'Tech', 'Cultural', 'Educational'];

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await api.get('/events');
        setEvents(response.data);
      } catch (error) {
        console.log('Erro ao carregar eventos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  if (loading) {
    return (
      <Container>
        <Header />
        <Content>
          <SectionTitle style={{ color: 'white', marginTop: 40 }}>Loading events…</SectionTitle>
        </Content>
      </Container>
    );
  }

  const liveEvent = events.find(e => e.status === 'live');

  const upcomingEvents = events.filter(
    e =>
      ['upcoming', 'active', 'planned'].includes(e.status) &&
      e.category?.toLowerCase().includes(selectedCategory.toLowerCase()),
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
  background-color: ${({ theme }: any) => theme.colors.background};
`;

const Content = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  bounces: false,
})`
  flex: 1;
`;

const PaddedContent = styled.View`
  padding: 0 ${({ theme }: any) => theme.spacing.margemLateral}px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }: any) => theme.spacing.xl}px;
  margin-bottom: ${({ theme }: any) => theme.spacing.md}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }: any) => theme.colors.white};
  /* Token: h */
  font-family: ${({ theme }: any) => theme.text.titulo.h.fontFamily};
  font-size: ${({ theme }: any) => theme.text.titulo.h.fontSize}px;
`;

// Ajuste do SeeMore para parecer um botão (adicionado padding para facilitar o toque)
const SeeMore = styled.Text`
  /* Token: corpo.corpoTexto */
  font-family: ${({ theme }: any) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }: any) => theme.text.corpo.corpoTexto.fontSize}px;
  line-height: ${({ theme }: any) => theme.text.corpo.corpoTexto.lineHeight}px;

  /* Cor e espaçamento */
  color: ${({ theme }: any) => theme.colors.primary_50};
  padding: 5px;
`;

const SearchWrapper = styled.View`
  margin-top: ${({ theme }: any) => theme.spacing.lg}px;
`;
