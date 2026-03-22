import React, { useState, useMemo } from 'react';
import { ScrollView, StatusBar, View, Modal, Text } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation, Stack } from 'expo-router'; // Adicionado Stack
import Head from 'expo-router/head'; // Adicionado Head
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

// Componentes e Dados
import { HeroBanner } from '../../components/HeroBanner';
import eventsData from '../../data/events.json';
import usersData from '../../data/users.json';
import { userImages } from '../../assets/images/Users/userImages';

// --- Styled Components ---

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BackButton = styled.Pressable`
  position: absolute;
  top: ${({ theme }) => theme.spacing.xl}px;
  left: ${({ theme }) => theme.spacing.margemLateral}px;
  z-index: 99;
  background-color: rgba(0, 0, 0, 0.4);
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
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

const LinkButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 220px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  align-self: center;
  /* Corrigido para evitar erro de shadow na Web */
  box-shadow: 0px 4px 15px rgba(255, 255, 255, 0.15);
  elevation: 2;
`;

const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.botao.fontFamily};
  font-size: ${({ theme }) => theme.text.botao.fontSize}px;
  font-weight: bold;
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

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

const ModalContent = styled.View`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  width: 95%;
  border-radius: ${({ theme }) => theme.borderRadius.xlarge}px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  align-items: center;
`;

const ModalTitle = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h.fontSize}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const ModalDescription = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const CodeRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const CodeBox = styled.View`
  width: 40px;
  height: 50px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
`;

const ModalButtons = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const ModalBtn = styled.TouchableOpacity<{ isPrimary?: boolean }>`
  flex: 0.48;
  background-color: ${({ isPrimary, theme }) => (isPrimary ? theme.colors.primary : '#E5D9F2')};
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  align-items: center;
`;

const ModalBtnText = styled.Text<{ isPrimary?: boolean }>`
  font-family: ${({ theme }) => theme.text.botao.fontFamily};
  font-size: ${({ theme }) => theme.text.botao.fontSize}px;
  color: ${({ isPrimary, theme }) => (isPrimary ? theme.colors.white : theme.colors.primary)};
`;

// --- Screen ---

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const event = eventsData.events.find(e => e.id === id);

  const randomFriends = useMemo(
    () => [...usersData].sort(() => 0.5 - Math.random()).slice(0, 3),
    [],
  );

  if (!event) return null;

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else router.replace('/');
  };

  const pageTitle = `${event.name} | Safinity`;

  return (
    <Container>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Stack.Screen options={{ title: pageTitle, headerShown: false }} />

      <StatusBar barStyle="light-content" />

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        accessibilityViewIsModal={true} // Melhora acessibilidade mobile
        // @ts-ignore
        aria-modal="true" // Melhora acessibilidade Web
      >
        <ModalOverlay>
          <ModalContent accessibilityRole="alert">
            <ModalTitle accessibilityRole="header" aria-level={2}>
              Link my ticket
            </ModalTitle>
            <ModalDescription>
              Your ticket has a{' '}
              <Text style={{ color: '#E5D9F2', fontWeight: 'bold' }}>6-digit validation code</Text>.
              Enter that code below!
            </ModalDescription>

            <CodeRow
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel="6-digit validation code. Required field."
              // @ts-ignore
              aria-required="true"
            >
              {[1, 2, 3, 4, 5, 6].map(i => (
                <CodeBox key={i} />
              ))}
            </CodeRow>

            <ModalButtons>
              <ModalBtn
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Cancel ticket linking"
              >
                <ModalBtnText>Cancel</ModalBtnText>
              </ModalBtn>
              <ModalBtn
                isPrimary
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Link your ticket"
              >
                <ModalBtnText isPrimary>Link</ModalBtnText>
              </ModalBtn>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      </Modal>

      <BackButton onPress={handleBack} accessibilityLabel="Go back" accessibilityRole="button">
        <Ionicons name="arrow-back" size={24} color="white" />
      </BackButton>

      <ScrollView bounces={false} showsVerticalScrollIndicator={false} accessibilityRole="main">
        <HeroBanner event={event} isDetail />

        <ContentCard>
          <SectionTitle accessibilityRole="header" aria-level={2}>
            Description
          </SectionTitle>
          <DescriptionText>{event.description}</DescriptionText>

          <ActionGrid>
            <ActionButton
              onPress={() => router.push('/(tabs)/map')}
              accessibilityLabel="View event map"
            >
              <Ionicons name="map-outline" size={26} color="white" />
              <ActionLabel>Map</ActionLabel>
            </ActionButton>

            <ActionButton
              onPress={() => router.push('/(tabs)/calendar')}
              accessibilityLabel="View in calendar"
            >
              <Ionicons name="calendar-outline" size={26} color="white" />
              <ActionLabel>Calendar</ActionLabel>
            </ActionButton>
          </ActionGrid>

          <SectionTitle accessibilityRole="header" aria-level={2}>
            Friends going
          </SectionTitle>
          <FriendsSection accessible={true} accessibilityLabel={`3 friends and 2 more are going`}>
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

          <LinkButton
            onPress={() => setModalVisible(true)}
            accessibilityRole="button"
            accessibilityHint="Opens a popup to enter your ticket code"
          >
            <ButtonText>Link my ticket</ButtonText>
          </LinkButton>

          <View style={{ height: 50 }} />
        </ContentCard>
      </ScrollView>
    </Container>
  );
}
