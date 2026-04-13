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

  // Altera o teu return para incluir estes roles estruturais:

  return (
    <Container>
      <Head>
        <title>Home | Safinity</title>
      </Head>
      <Stack.Screen options={{ title: 'Home | Safinity', headerShown: false }} />

      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. O Header deve ter role de banner (topo da página) */}
      <Header role="banner" />

      {/* 2. O conteúdo principal deve ter role de main */}
      <Content role="main">
        {liveEvent && <HeroBanner event={liveEvent} />}

        <PaddedContent>
          <SearchWrapper>
            <SearchInput value={searchValue} onChangeText={setSearchValue} variant="homepage" />
          </SearchWrapper>
        </PaddedContent>

        {/* 3. Filtros são tecnicamente uma navegação de categorias */}
        <FilterTags
          tags={categories}
          selectedTags={[selectedCategory]}
          onTagPress={setSelectedCategory}
          variant="homepage"
          accessible={true}
          role="tablist" // Indica que é uma lista de opções selecionáveis
        />

        <PaddedContent>
          <SectionHeader>
            <SectionTitle
              accessible={true}
              role="header"
              // @ts-ignore
              aria-level="2"
            >
              {selectedCategory} events
            </SectionTitle>

            <Pressable
              onPress={() => router.push('/events-list')}
              accessible={true}
              role="link"
              accessibilityLabel={`Ver mais eventos de ${selectedCategory}`}
              // ADICIONADO PARA ACESSIBILIDADE DE TECLADO:
              onKeyDown={(e: any) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  router.push('/events-list');
                }
              }}
            >
              <SeeMore>See more</SeeMore>
            </Pressable>
          </SectionHeader>
        </PaddedContent>

        {/* 4. A lista de eventos é uma lista de conteúdos */}
        <FlatList
          horizontal
          data={upcomingEvents}
          renderItem={({ item }) => <EventCard event={item} />}
          keyExtractor={item => item.id}
          role="list" // Indica que os itens abaixo formam uma lista
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

// Ajuste do SeeMore para parecer um botão (adicionado padding para facilitar o toque)
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
