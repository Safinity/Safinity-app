import React, { useState } from 'react';
import { FlatList, StatusBar } from 'react-native';
import styled from 'styled-components/native';

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
  margin-top: 40px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SectionTitle = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.white};
`;

const SeeMore = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary_50};
  font-weight: extralight;
`;

const SearchWrapper = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;

export default function HomeScreen() {
  // ✅ Adicionei o estado para o SearchInput
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Musical');

  const categories = ['Musical', 'Technology', 'Cultural', 'Educational'];

  const liveEvent = eventsData.events.find(e => e.status === 'live');
  const upcomingEvents = eventsData.events.filter(
    e => e.status === 'upcoming' && e.category.toLowerCase() === selectedCategory.toLowerCase(),
  );

  return (
    <Container>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Header />

      <Content>
        {/* Hero Banner */}
        {liveEvent && <HeroBanner event={liveEvent} />}

        {/* Search Input */}
        <PaddedContent>
          <SearchWrapper>
            <SearchInput value={searchValue} onChangeText={setSearchValue} variant="homepage" />
          </SearchWrapper>
        </PaddedContent>

        {/* Filter Tags */}
        <FilterTags
          tags={categories}
          selectedTags={[selectedCategory]}
          onTagPress={setSelectedCategory}
          variant="homepage"
        />

        {/* Section Header */}
        <PaddedContent>
          <SectionHeader>
            <SectionTitle>{selectedCategory} events</SectionTitle>
            <SeeMore>See more</SeeMore>
          </SectionHeader>
        </PaddedContent>

        {/* Upcoming Events List */}
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
