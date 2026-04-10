import React, { useState } from 'react';
import { FlatList, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { useRouter, Stack } from 'expo-router'; // Adicionado Stack
import Head from 'expo-router/head'; // Adicionado Head

// Imports de UI e Componentes
import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { HeroBanner } from '../../components/HeroBanner';
import { EventCard } from '../../components/EventCard';
import eventsData from '../../data/events.json';

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
  margin-bottom: 0px;
`;

const VerticalSpacer = styled.View`
  height: 120px;
`;

export default function EventsListScreen() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  // Categorias que aparecem selecionadas por defeito
  const [selectedCategories, setSelectedCategories] = useState([
    'Musical',
    'Technology',
    'Cultural',
  ]);
  const allCategories = ['Musical', 'Technology', 'Cultural', 'Educational'];

  // Função para gerir o filtro de tags (múltipla seleção)
  const handleTagPress = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  return (
    <Container>
      {/* Metadados para a aba do browser e navegação */}
      <Head>
        <title>Events List | Safinity</title>
      </Head>
      <Stack.Screen options={{ title: 'Events List | Safinity', headerShown: false }} />

      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header com papel semântico */}
      <Header role="banner" />

      <Content role="main">
        {/* Banner com Título Principal (H1) */}
        <HeroBanner
          event={{
            id: 'banner-lista-eventos',
          }}
          title="What's Coming Up"
          description="Discover events with safety you can trust"
          hideMap={true}
          role="header"
          // @ts-ignore
          aria-level="1"
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
          role="tablist"
        />

        {selectedCategories.map(category => {
          const sectionEvents = eventsData.events.filter(
            e => e.category.toLowerCase() === category.toLowerCase(),
          );

          if (sectionEvents.length === 0) return null;

          return (
            <SectionContainer key={category}>
              <PaddedContent>
                <SectionHeader>
                  <SectionTitle
                    role="header"
                    // @ts-ignore
                    aria-level="2"
                  >
                    {category} events
                  </SectionTitle>
                </SectionHeader>
              </PaddedContent>

              <FlatList
                horizontal
                data={sectionEvents}
                renderItem={({ item }) => <EventCard event={item} variant="compact" />}
                keyExtractor={item => `${category}-${item.id}`}
                role="list"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingLeft: 40,
                  paddingRight: 40,
                }}
                snapToInterval={280 + 16}
                decelerationRate="fast"
              />
            </SectionContainer>
          );
        })}

        <VerticalSpacer />
      </Content>
    </Container>
  );
}
