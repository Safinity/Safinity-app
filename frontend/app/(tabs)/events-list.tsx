import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StatusBar, ActivityIndicator, View } from 'react-native';
import styled from 'styled-components/native';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useAuth } from '@clerk/expo';
import api from '../../utils/api';

// Imports de UI e Componentes
import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { HeroBanner } from '../../components/HeroBanner';
import { EventCard } from '../../components/EventCard';
import { matchesEventSearch } from '../../utils/eventSearch';

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
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h.fontSize}px;
`;

const SearchWrapper = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;

const SectionContainer = styled.View`
  margin-bottom: 20px;
`;

const VerticalSpacer = styled.View`
  height: 120px;
`;

const EmptySearchState = styled.Text`
  color: ${({ theme }: any) => theme.colors.textMuted};
  font-family: ${({ theme }: any) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }: any) => theme.text.corpo.corpoTexto.fontSize}px;
  line-height: ${({ theme }: any) => theme.text.corpo.corpoTexto.lineHeight}px;
  text-align: center;
  padding: ${({ theme }: any) => theme.spacing.xl}px
    ${({ theme }: any) => theme.spacing.margemLateral}px;
`;

export default function EventsListScreen() {
  const { getToken } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const allCategories = ['Music', 'Tech', 'Cultural', 'Educational'];
  const [selectedCategories, setSelectedCategories] = useState(['Music', 'Tech']);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = await getToken();

        const response = await api.get('/events', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = Array.isArray(response.data) ? response.data : [response.data];

        setEvents(data);
      } catch (error: any) {
        console.error('=== ERRO EVENTS ===');
        console.error('Status:', error.response?.status);
        console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Mensagem:', error.message);
        console.error('=== FIM ERRO ===');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [getToken]);

  const handleTagPress = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const searchedEvents = useMemo(
    () => events.filter(event => matchesEventSearch(event, searchValue)),
    [events, searchValue],
  );

  const filteredEvents = useMemo(() => {
    if (selectedCategories.length === 0) {
      return searchedEvents;
    }

    return searchedEvents.filter(event => {
      const category = event.category ? String(event.category).trim().toLowerCase() : '';

      return selectedCategories.some(selected => selected.toLowerCase() === category);
    });
  }, [searchedEvents, selectedCategories]);

  const visibleCategories =
    selectedCategories.length > 0
      ? selectedCategories
      : Array.from(
          new Set(
            filteredEvents
              .map((event: any) => (event.category ? String(event.category).trim() : ''))
              .filter(Boolean),
          ),
        );

  return (
    <Container>
      <Head>
        <title>Events List | Safinity</title>
      </Head>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Header />

      <Content role="main">
        <HeroBanner
          event={{ id: 'banner-lista-eventos' }}
          title="What's Coming Up"
          description="Discover events with safety you can trust"
          hideMap={true}
        />

        <PaddedContent>
          <SearchWrapper>
            <SearchInput
              value={searchValue}
              onChangeText={setSearchValue}
              variant="homepage"
              placeholder="Find your next event"
            />
          </SearchWrapper>
        </PaddedContent>

        <FilterTags
          tags={allCategories}
          selectedTags={selectedCategories}
          onTagPress={handleTagPress}
          variant="homepage"
        />

        {isLoading ? (
          <View style={{ marginTop: 50 }}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <>
            {filteredEvents.length === 0 ? (
              <EmptySearchState>
                No events found{searchValue.trim() ? ` for “${searchValue.trim()}”` : ''}.
              </EmptySearchState>
            ) : null}

            {visibleCategories.map(category => {
              const sectionEvents = filteredEvents.filter((e: any) => {
                const apiCat = e.category ? String(e.category).trim().toLowerCase() : '';
                return apiCat === category.toLowerCase();
              });

              if (sectionEvents.length === 0) return null;

              return (
                <SectionContainer key={category}>
                  <PaddedContent>
                    <SectionHeader>
                      <SectionTitle>{category} events</SectionTitle>
                    </SectionHeader>
                  </PaddedContent>

                  <FlatList
                    horizontal
                    data={sectionEvents}
                    keyExtractor={item => `event-${item.id}`}
                    renderItem={({ item }) => <EventCard event={item} variant="compact" />}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 40, paddingRight: 40 }}
                    snapToInterval={280 + 16}
                    decelerationRate="fast"
                  />
                </SectionContainer>
              );
            })}
          </>
        )}

        <VerticalSpacer />
      </Content>
    </Container>
  );
}
