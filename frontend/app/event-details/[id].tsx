import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, StatusBar, View, Text } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Head from 'expo-router/head';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/ui/header';
import api from '../../utils/api';
import { LinkTicketModal } from '../../components/LinkTicketModal';

// Componentes
import { HeroBanner } from '../../components/HeroBanner';
import usersData from '../../data/users.json';
import { userImages } from '../../assets/images/Users/userImages';

function formatEventDateRange(start?: string | null, end?: string | null) {
  if (!start) return 'Date TBD';

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;

  if (Number.isNaN(startDate.getTime())) return 'Date TBD';

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (!endDate || Number.isNaN(endDate.getTime())) {
    return dateFormatter.format(startDate);
  }

  const isSameDay = startDate.toDateString() === endDate.toDateString();
  if (isSameDay) {
    return dateFormatter.format(startDate);
  }

  return `${dateFormatter.format(startDate)} - ${dateFormatter.format(endDate)}`;
}

function formatEventTimeRange(start?: string | null, end?: string | null) {
  if (!start) return 'Time TBD';

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;

  if (Number.isNaN(startDate.getTime())) return 'Time TBD';

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!endDate || Number.isNaN(endDate.getTime())) {
    return timeFormatter.format(startDate);
  }

  return `${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`;
}

function normalizeEvent(event: any) {
  return {
    ...event,
    displayDate: formatEventDateRange(event.start_date, event.end_date),
    displayTime: formatEventTimeRange(event.start_date, event.end_date),
  };
}

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ⚠️ ESTE useMemo TEM DE VIR ANTES DE QUALQUER RETURN
  const randomFriends = useMemo(
    () => [...usersData].sort(() => 0.5 - Math.random()).slice(0, 3),
    [],
  );

  // Buscar evento real da API
  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(normalizeEvent(response.data));
      } catch (error) {
        console.log('Erro ao carregar evento:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  // Loading mínimo
  if (loading) {
    return (
      <Container>
        <Header />
        <ScrollView>
          <Text style={{ color: 'white', marginTop: 40, textAlign: 'center' }}></Text>
        </ScrollView>
      </Container>
    );
  }

  // Caso o evento não exista
  if (!event) {
    return (
      <Container>
        <Header />
        <ScrollView>
          <Text style={{ color: 'white', marginTop: 40, textAlign: 'center' }}>
            Event not found
          </Text>
        </ScrollView>
      </Container>
    );
  }

  const pageTitle = `${event.name} | Safinity`;

  return (
    <Container>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Stack.Screen options={{ title: pageTitle, headerShown: false }} />

      <StatusBar barStyle="light-content" />

      <LinkTicketModal
        visible={modalVisible}
        eventId={id}
        onClose={() => setModalVisible(false)}
        onLinked={ticket =>
          router.push({
            pathname: '/(tabs)/perfil/ticket',
            params: { eventId: ticket.event_id, ticketId: ticket.id },
          })
        }
      />

      {/* Conteúdo */}
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} role="main">
        <HeroBanner event={event} isDetail detailType="event" />
        <Header variant="pageDetails" />

        <ContentCard>
          <SectionTitle role="header" aria-level={2}>
            Description
          </SectionTitle>

          <DescriptionText>{event.description}</DescriptionText>

          <ActionGrid>
            <ActionButton
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/map',
                  params: { eventId: String(id) },
                })
              }
            >
              <Ionicons name="map-outline" size={26} color="white" />
              <ActionLabel>Map</ActionLabel>
            </ActionButton>

            <ActionButton
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/calendar',
                  params: { eventId: String(id) },
                })
              }
            >
              <Ionicons name="calendar-outline" size={26} color="white" />
              <ActionLabel>Calendar</ActionLabel>
            </ActionButton>
          </ActionGrid>

          <SectionTitle role="header" aria-level={2}>
            Friends going
          </SectionTitle>

          <FriendsSection accessible={true}>
            <AvatarStack>
              {randomFriends.map((friend, index) => (
                <Avatar
                  key={friend.id}
                  source={userImages[friend.image]}
                  style={{ marginLeft: index === 0 ? 0 : -15 }}
                />
              ))}
            </AvatarStack>
            <DescriptionText>+ 2 friends going</DescriptionText>
          </FriendsSection>

          <LinkButton onPress={() => setModalVisible(true)} role="button">
            <ButtonText>Link my ticket</ButtonText>
          </LinkButton>

          <View style={{ height: 50 }} />
        </ContentCard>
      </ScrollView>
    </Container>
  );
}

/* --- Styled Components (mantidos exatamente como estavam) --- */

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ContentCard = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  padding-horizontal: ${({ theme }) => theme.spacing.margemLateral}px;
  padding-top: 0px;
  min-height: 500px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize}px;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const DescriptionText = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  line-height: ${({ theme }) => theme.text.corpo.corpoTexto.lineHeight}px;
`;

const ActionGrid = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;

const ActionButton = styled.TouchableOpacity`
  width: 48%;
  height: ${({ theme }) => theme.height.actionbutton}px;
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  justify-content: center;
  align-items: center;
`;

const ActionLabel = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  font-family: ${({ theme }) => theme.text.label.fontFamily};
  font-size: ${({ theme }) => theme.text.label.fontSize + 2}px;
`;

const FriendsSection = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const AvatarStack = styled.View`
  flex-direction: row;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

const Avatar = styled.Image`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.background};
`;

const LinkButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 220px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  align-self: center;
  box-shadow: 0px 4px 15px rgba(255, 255, 255, 0.15);
  elevation: 2;
`;

const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.botao.fontFamily};
  font-size: ${({ theme }) => theme.text.botao.fontSize}px;
  font-weight: bold;
`;
