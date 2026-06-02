import React, { useEffect, useState } from 'react';
import { FlatList, StatusBar, ActivityIndicator, Text, View } from 'react-native';
import styled from 'styled-components/native';
import { useRouter, Stack } from 'expo-router';
import Head from 'expo-router/head';
import api from '../../utils/api';

// Imports de UI e Componentes
import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { HeroBanner } from '../../components/HeroBanner';
import { EventCard } from '../../components/EventCard';

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

const DebugText = styled.Text`
  color: #ff6b6b;
  font-size: 12px;
  margin: 10px 40px;
  font-family: monospace;
`;

export default function EventsListScreen() {
  const [searchValue, setSearchValue] = useState('');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Categorias esperadas (Devem bater com o teu allCategories)
  const allCategories = ['Music', 'Tech', 'Cultural', 'Educational'];
  const [selectedCategories, setSelectedCategories] = useState(['Music', 'Tech']);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Se usares Android Emulator, troca localhost por 10.0.2.2
        const response = await api.get('/events');
        const data = Array.isArray(response.data) ? response.data : [response.data];

        console.log('Dados crus da API:', data);
        setEvents(data);
      } catch (error) {
        console.error('Erro ao conectar ao NestJS:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleTagPress = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

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
          event={{ id: 'banner-lista-eventos', image: null }}
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
            {/* Se a API deu dados mas nada aparece nos filtros, este aviso aparece */}
            {events.length > 0 &&
              selectedCategories.every(
                cat =>
                  !events.some((e: any) => e.category?.toLowerCase().trim() === cat.toLowerCase()),
              ) && (
                <DebugText>
                  ⚠️ API enviou {events.length} eventos, mas as categorias não batem. Vê se no
                  Postgres está: {events.map((e: any) => e.category).join(', ')}
                </DebugText>
              )}

            {selectedCategories.map(category => {
              // FILTRO ULTRA-ROBUSTO: trim() remove espaços, toLowerCase() ignora Caps
              const sectionEvents = events.filter((e: any) => {
                const apiCat = e.category ? String(e.category).trim().toLowerCase() : '';
                return apiCat.includes(category.toLowerCase());
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
