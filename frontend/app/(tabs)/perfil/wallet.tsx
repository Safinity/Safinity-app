import { useAuth } from '@clerk/expo';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components/native';
import { Colors, Spacing, TextStyles } from '../../../constants/theme';
import { ActivityIndicator, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import Header from '../../../components/ui/header';
import SearchInput from '../../../components/ui/SearchInput';
import PrimaryButton from '../../../components/PrimaryButton';
import { WalletCard } from '../../../components/WalletCard';
import { LinkTicketModal } from '../../../components/LinkTicketModal';
import { getMyProfile } from '../../../utils/profile';
import { getUserTickets, type UserTicket } from '../../../utils/tickets';

const WalletScreen = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [firstName, setFirstName] = useState('Wallet');
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    let isActive = true;

    async function loadWallet() {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        setTickets([]);
        setError('Please sign in to view your wallet.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const token = await getTokenRef.current();
        const [profile, userTickets] = await Promise.all([
          getMyProfile(token),
          getUserTickets(token),
        ]);

        if (!isActive) {
          return;
        }

        setFirstName((profile.name || profile.email || 'Wallet').split(' ')[0]);
        setTickets(userTickets);
      } catch (walletError) {
        console.error('Failed to load wallet tickets', walletError);
        if (isActive) {
          setError('Unable to load wallet tickets.');
          setTickets([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadWallet();

    return () => {
      isActive = false;
    };
  }, [isLoaded, isSignedIn]);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return tickets.filter(ticket => {
      const eventName = ticket.event?.name?.toLowerCase() ?? '';
      const venueName = ticket.event?.venue_name?.toLowerCase() ?? '';

      return eventName.includes(normalizedSearch) || venueName.includes(normalizedSearch);
    });
  }, [searchText, tickets]);

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
            placeholder="Search tickets..."
            onChangeText={setSearchText}
          />

          <Spacer />

          <PrimaryButton title="Add new ticket" onPress={() => setLinkModalVisible(true)} />

          <CardsSpacer />

          {isLoading ? (
            <LoadingState>
              <ActivityIndicator color="white" />
              <StateText>Loading...</StateText>
            </LoadingState>
          ) : error ? (
            <StateText>{error}</StateText>
          ) : filteredTickets.length === 0 ? (
            <StateText>No tickets found</StateText>
          ) : (
            <EventsContainer>
              {filteredTickets.map(ticket =>
                ticket.event ? (
                  <WalletCard key={ticket.id} event={ticket.event} ticketId={ticket.id} />
                ) : null,
              )}
            </EventsContainer>
          )}

          <BottomSpacer />
        </Content>
      </ScrollView>

      <LinkTicketModal
        visible={linkModalVisible}
        onClose={() => setLinkModalVisible(false)}
        onLinked={ticket => {
          setError('');
          setTickets(previousTickets => [
            ticket,
            ...previousTickets.filter(previousTicket => previousTicket.id !== ticket.id),
          ]);
        }}
      />
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

const LoadingState = styled.View`
  align-items: center;
  justify-content: center;
  padding-vertical: ${Spacing.xl}px;
`;

const StateText = styled.Text`
  color: ${Colors.inactive};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  text-align: center;
  margin-top: ${Spacing.sm}px;
`;

const BottomSpacer = styled.View`
  height: ${Spacing.xxl}px;
`;