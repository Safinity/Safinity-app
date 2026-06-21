import { useAuth } from '@clerk/expo';
import React, { useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { ActivityIndicator, Alert, ImageBackground } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, TextStyles } from '../../../constants/theme';
import Header from '../../../components/ui/header';
import PrimaryButton from '../../../components/PrimaryButton';
import { deleteUserTicket, getUserTickets, type UserTicket } from '../../../utils/tickets';
import { getEventImageSource as resolveEventImageSource } from '../../../utils/eventImages';

// NOVOS IMPORTS: Imagens de fundo para Light e Dark Mode
import ProfileFundoImg from '../../../assets/images/Profile-fundo.png';
import ProfileFundoDarkImg from '../../../assets/images/Profile-fundo-dark.png';

const fallbackTicketImage = require('../../../assets/images/bg-card-wallet.png');

function getEventImageSource(ticket: UserTicket | null) {
  return resolveEventImageSource(ticket?.event?.image, fallbackTicketImage);
}

function formatEventDate(start?: string | null, end?: string | null) {
  if (!start || !end) return 'Date TBD';

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const month = startDate.toLocaleString('en-GB', { month: 'long' });
    const year = startDate.getFullYear();

    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDay}-${endDay} ${month} ${year}`;
    }

    return `${startDay} ${startDate.toLocaleString('en-GB', {
      month: 'short',
    })} - ${endDay} ${endDate.toLocaleString('en-GB', { month: 'short' })} ${year}`;
  } catch {
    return 'Invalid Date';
  }
}

function formatLinkedAt(value?: string | null) {
  if (!value) return 'Not available';

  try {
    return new Date(value).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
}

function formatBarcode(value: string) {
  return value.split('').join(' ');
}

const TicketScreen = () => {
  const theme = useTheme();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const { eventId, ticketId } = useLocalSearchParams<{
    eventId?: string;
    ticketId?: string;
  }>();
  const [ticket, setTicket] = useState<UserTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    let isActive = true;

    async function loadTicket() {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        setTicket(null);
        setError('Please sign in to view your ticket.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const token = await getTokenRef.current();
        const tickets = await getUserTickets(token);
        const selectedTicket =
          tickets.find(item => item.id === ticketId) ??
          tickets.find(item => item.event_id === eventId) ??
          null;

        if (isActive) {
          setTicket(selectedTicket);
          setError(selectedTicket ? '' : 'Ticket not found');
        }
      } catch (ticketError) {
        console.error('Failed to load ticket', ticketError);
        if (isActive) {
          setTicket(null);
          setError('Unable to load ticket.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadTicket();

    return () => {
      isActive = false;
    };
  }, [eventId, isLoaded, isSignedIn, ticketId]);

  const handleDeleteTicket = () => {
    if (!ticket) {
      return;
    }

    Alert.alert('Delete ticket', 'Are you sure you want to delete this ticket?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);
            const token = await getTokenRef.current();
            await deleteUserTicket(token, ticket.id);
            router.replace('/perfil/wallet');
          } catch (deleteError) {
            console.error('Failed to delete ticket', deleteError);
            Alert.alert('Unable to delete ticket', 'Please try again.');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const event = ticket?.event;
  const imageSource = getEventImageSource(ticket);

  // Define dinamicamente a imagem com base no modo de tema reativo
  const backgroundImage = theme.colors.mode === 'dark' ? ProfileFundoDarkImg : ProfileFundoImg;

  return (
    <Container source={backgroundImage}>
      <Stack.Screen options={{ title: 'Ticket' }} />
      <Header
        variant="back"
        colorScheme={theme.colors.mode === 'light' ? 'light' : 'dark'}
        title="Ticket"
        showBottomDivider={false}
      />

      <TicketBody>
        {isLoading ? (
          <LoadingState>
            <ActivityIndicator color={theme.colors.primary} />
            <ErrorText>Loading...</ErrorText>
          </LoadingState>
        ) : error || !ticket || !event ? (
          <LoadingState>
            <ErrorText>{error || 'Ticket not found'}</ErrorText>
          </LoadingState>
        ) : (
          <Content>
            <TicketCard>
              <EventImage source={imageSource} />

              <TicketStatusContainer>
                <TicketStatusLabel>Ticket Code</TicketStatusLabel>
                <TicketStatusValue>{ticket.ticket_code}</TicketStatusValue>
              </TicketStatusContainer>

              <TicketHeader>
                <EventName>{event.name || 'Untitled Event'}</EventName>
              </TicketHeader>

              <TicketInfo>
                <InfoRow>
                  <InfoLabel>Date:</InfoLabel>
                  <InfoValue>{formatEventDate(event.start_date, event.end_date)}</InfoValue>
                </InfoRow>

                <InfoRow>
                  <InfoLabel>Location:</InfoLabel>
                  <InfoValue>{event.venue_name || 'Location TBD'}</InfoValue>
                </InfoRow>

                <InfoRow>
                  <InfoLabel>Linked at:</InfoLabel>
                  <InfoValue>{formatLinkedAt(ticket.linked_at)}</InfoValue>
                </InfoRow>

                <InfoRow>
                  <InfoLabel>Status:</InfoLabel>
                  <InfoValue>{event.status || 'Active'}</InfoValue>
                </InfoRow>
              </TicketInfo>

              <ButtonContainer>
                <PrimaryButton
                  title="View Event Details"
                  onPress={() => router.push(`/event-details/${event.id}`)}
                />
              </ButtonContainer>

              <Divider />

              <BarcodeSection>
                <BarcodeText>{formatBarcode(ticket.ticket_code)}</BarcodeText>
              </BarcodeSection>
            </TicketCard>

            <DeleteButtonContainer>
              <PrimaryButton
                title={isDeleting ? 'Deleting...' : 'Delete Ticket'}
                disabled={isDeleting}
                onPress={handleDeleteTicket}
              />
            </DeleteButtonContainer>
          </Content>
        )}
      </TicketBody>
    </Container>
  );
};

export default TicketScreen;

// ALTERADO: Container agora estende o ImageBackground e injeta resizeMode
const Container = styled(ImageBackground).attrs({
  resizeMode: 'cover',
})`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TicketBody = styled.View`
  flex: 1;
  padding-top: ${({ theme }) => theme.spacing.margemTop}px;
  padding-horizontal: ${({ theme }) => theme.spacing.margemLateral}px;
  justify-content: center;
`;

const Content = styled.View`
  align-items: center;
  justify-content: center;
`;

const TicketCard = styled.View`
  width: 92%;
  max-width: ${({ theme }) => theme.height.lg}px;
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  background-color: ${Colors.white};
  overflow: hidden;
  shadow-color: #000;
  shadow-offset: 0px ${({ theme }) => theme.spacing.xxs}px;
  shadow-opacity: 0.1;
  shadow-radius: ${({ theme }) => theme.spacing.sm}px;
  elevation: 5;
`;

const EventImage = styled.Image`
  width: 100%;
  height: ${({ theme }) => theme.height.card.compact * 0.48}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TicketStatusContainer = styled.View`
  align-items: center;
  padding-vertical: ${Spacing.sm}px;
  padding-horizontal: ${Spacing.lg}px;
`;

const TicketStatusLabel = styled.Text`
  color: ${Colors.grayNavbar};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  margin-bottom: ${Spacing.xs}px;
`;

const TicketStatusValue = styled.Text`
  color: ${Colors.primary};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  font-weight: bold;
  text-align: center;
`;

const Divider = styled.View`
  width: 100%;
  height: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TicketHeader = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.grayNavbar};
  padding-bottom: ${Spacing.sm}px;
  margin-bottom: ${Spacing.sm}px;
  padding-horizontal: ${Spacing.lg}px;
  padding-top: ${Spacing.sm}px;
`;

const EventName = styled.Text`
  color: ${Colors.primary};
  font-family: ${TextStyles.titulo.h1.fontFamily};
  font-size: ${TextStyles.titulo.h1.fontSize}px;
  line-height: ${TextStyles.titulo.h1.lineHeight}px;
`;

const TicketInfo = styled.View`
  gap: ${Spacing.sm}px;
  padding-horizontal: ${Spacing.lg}px;
  padding-vertical: ${Spacing.sm}px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const InfoLabel = styled.Text`
  color: ${Colors.grayNavbar};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  font-weight: 600;
`;

const InfoValue = styled.Text`
  color: ${Colors.grayNavbar};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  flex: 1;
  text-align: right;
  margin-left: ${Spacing.md}px;
`;

const ButtonContainer = styled.View`
  padding-horizontal: ${Spacing.lg}px;
  padding-vertical: ${Spacing.sm}px;
`;

const BarcodeSection = styled.View`
  height: ${({ theme }) => theme.height.sm}px;
  background-color: ${Colors.white};
  align-items: center;
  justify-content: center;
  border-top-width: 1px;
  border-top-color: ${Colors.grayNavbar};
`;

const BarcodeText = styled.Text`
  color: ${Colors.grayNavbar};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  letter-spacing: 2px;
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  padding: ${Spacing.lg}px;
  text-align: center;
`;

const LoadingState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const DeleteButtonContainer = styled.View`
  width: 92%;
  max-width: ${({ theme }) => theme.height.lg}px;
  padding-top: ${Spacing.md}px;
`;