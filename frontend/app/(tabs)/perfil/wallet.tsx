import React, { useState, useMemo } from 'react';
import styled from 'styled-components/native';
import { Colors, Spacing } from '../../../constants/theme';
import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import Header from '../../../components/ui/header';
import SearchInput from '../../../components/ui/SearchInput';
import PrimaryButton from '../../../components/PrimaryButton';
import { WalletCard } from '../../../components/WalletCard';
import eventsData from '../../../data/events.json';
import usersData from '../../../data/users.json';

const WalletScreen = () => {
  const [searchText, setSearchText] = useState('');
  const currentUser = usersData.find(user => user.id === 'u6') || { name: 'User' };
  const firstName = currentUser.name.split(' ')[0];

  const filteredEvents = useMemo(() => {
    return eventsData.events
      .filter(event => event.name.toLowerCase().includes(searchText.toLowerCase()))
      .slice(0, 6);
  }, [searchText]);

  return (
    <Container>
      <Stack.Screen options={{ title: `${firstName}'s Wallet` }} />
      <Header variant="back" title={`${firstName}'s Wallet`} showBottomDivider={false} />

      <ScrollView
        contentContainerStyle={{ paddingTop: 120, paddingHorizontal: Spacing.margemLateral }}
        showsVerticalScrollIndicator={false}
      >
        <Content>
          <SearchInputSpacer />

          <SearchInput
            variant="homepage"
            placeholder="Search wallet items..."
            onChangeText={setSearchText}
          />

          <Spacer />

          <PrimaryButton title="Add Item" onPress={() => console.log('Add item pressed')} />

          <CardsSpacer />

          <EventsContainer>
            {filteredEvents.map(event => (
              <WalletCard key={event.id} event={event} />
            ))}
          </EventsContainer>

          <BottomSpacer />
        </Content>
      </ScrollView>
    </Container>
  );
};

export default WalletScreen;

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const Content = styled.View`
  flex: 1;
`;

const SearchInputSpacer = styled.View`
  height: 24px;
`;

const Spacer = styled.View`
  height: ${Spacing.lg}px;
`;

const CardsSpacer = styled.View`
  height: 24px;
`;

const EventsContainer = styled.View`
  margin-vertical: ${Spacing.md}px;
`;

const BottomSpacer = styled.View`
  height: ${Spacing.xxl * 2}px;
`;
