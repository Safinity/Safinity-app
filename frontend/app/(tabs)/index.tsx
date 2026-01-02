import React, { useState } from 'react';
import { FlatList, ScrollView, StatusBar } from 'react-native';
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

// Container para elementos que respeitam a margem de 40px
const PaddedContent = styled.View`
  padding: 0 40px;
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
  color: ${({ theme }) => theme.colors.primary};
  opacity: 0.8;
`;

const SearchWrapper = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Musical');
  
  const liveEvent = eventsData.events.find(e => e.status === 'live');
  const upcomingEvents = eventsData.events.filter(
    e => e.status === 'upcoming' && e.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const categories = ['Musical', 'Technology', 'Cultural', 'Educational'];

  return (
    <Container>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Header />
      
      <Content>
        {/* 1. Hero Banner - Sem margens (Full Width) */}
        {liveEvent && <HeroBanner event={liveEvent} />}

        {/* 2. Conteúdo Estático com Margem de 40px */}
        <PaddedContent>
          <SearchWrapper>
            <SearchInput placeholder="Find your next event" />
          </SearchWrapper>
          
          <FilterTags 
            tags={categories} 
            selectedTags={[selectedCategory]} 
            onTagPress={(tag) => setSelectedCategory(tag)} 
          />

          <SectionHeader>
            <SectionTitle>{selectedCategory} events</SectionTitle>
            <SeeMore>See more</SeeMore>
          </SectionHeader>
        </PaddedContent>

        {/* 3. Carrossel Horizontal - Padding de 40px no início da lista */}
        <FlatList
          horizontal
          data={upcomingEvents}
          renderItem={({ item }) => <EventCard event={item} />}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingLeft: 40, 
            paddingRight: 40, 
            paddingBottom: 100 
          }}
          snapToInterval={280 + 16} 
          decelerationRate="fast"
        />
      </Content>
    </Container>
  );
}