import React, { useState } from 'react';
import { ScrollView, StatusBar, View, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

// Componentes e Dados
import { HeroBanner } from '../../components/HeroBanner';
import eventsData from '../../data/events.json';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BackButton = styled.Pressable`
  position: absolute;
  top: 50px;
  left: 20px;
  z-index: 99;
  background-color: rgba(0, 0, 0, 0.4);
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
`;

const ContentCard = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 40px;
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
  margin-top: 25px;
`;

const ActionButton = styled.TouchableOpacity`
  width: 48%;
  height: 100px;
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  justify-content: center;
  align-items: center;
`;

const ActionLabel = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  margin-top: 8px;
  font-family: ${({ theme }) => theme.text.label.fontFamily};
  font-size: ${({ theme }) => theme.text.label.fontSize + 2}px;
`;

const LinkButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 220px;
  padding: 18px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  align-items: center;
  margin-top: 40px;
  align-self: center;
  shadow-color: white;
  shadow-offset: 0px 0px;
  shadow-opacity: 0.15;
  shadow-radius: 10px;
  elevation: 4;
`;

const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.botao.fontFamily};
  font-size: ${({ theme }) => theme.text.botao.fontSize}px;
  font-weight: bold;
`;

// Estilos para a secção de Amigos
const FriendsSection = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
`;

const AvatarStack = styled.View`
  flex-direction: row;
  margin-right: 15px;
`;

const Avatar = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.background};
  margin-left: -15px;
`;

// --- ESTILOS DO POPUP (MODAL) ---
const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(256, 256, 256, 0.6);
  justify-content: center;
  align-items: center;
  padding: 25px;
`;

const ModalContent = styled.View`
  background-color: #303b49; /* Cor aproximada da imagem */
  width: 95%;
  border-radius: 30px;
  padding: 30px;
  align-items: center;
`;

const ModalTitle = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h.fontFamily};
  font-size: 24px;
  margin-bottom: 20px;
`;

const ModalDescription = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: 16px;
  line-height: 22px;
  margin-bottom: 30px;
`;

const CodeRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 30px;
`;

const CodeBox = styled.View`
  width: 42px;
  height: 50px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
`;

const ModalButtons = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
`;

const ModalBtn = styled.TouchableOpacity<{ isPrimary?: boolean }>`
  flex: 0.48;
  background-color: ${({ isPrimary, theme }) => (isPrimary ? theme.colors.primary : '#E5D9F2')};
  padding: 16px;
  border-radius: 25px;
  align-items: center;
`;

const ModalBtnText = styled.Text<{ isPrimary?: boolean }>`
  font-weight: bold;
  font-size: 16px;
  color: ${({ isPrimary, theme }) => (isPrimary ? theme.colors.white : theme.colors.primary)};
`;

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const event = eventsData.events.find(e => e.id === id);

  if (!event) return null;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.replace('/');
    }
  };

  return (
    <Container>
      <StatusBar barStyle="light-content" />

      {/* POPUP MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Link my ticket</ModalTitle>
            <ModalDescription>
              Your ticket, whether physical or digital, has a{' '}
              <ModalDescription style={{ color: '#E5D9F2', fontWeight: 'bold' }}>
                6-digit validation code
              </ModalDescription>
              . Now is the time to confirm your entry to the event by entering that code below.
            </ModalDescription>

            <CodeRow>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <CodeBox key={i} />
              ))}
            </CodeRow>

            <ModalButtons>
              <ModalBtn onPress={() => setModalVisible(false)}>
                <ModalBtnText>Cancel</ModalBtnText>
              </ModalBtn>
              <ModalBtn isPrimary onPress={() => setModalVisible(false)}>
                <ModalBtnText isPrimary>Link</ModalBtnText>
              </ModalBtn>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      </Modal>

      <BackButton onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </BackButton>

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <HeroBanner event={event} isDetail={true} />

        <ContentCard>
          <SectionTitle>Description</SectionTitle>
          <DescriptionText>{event.description}</DescriptionText>

          <ActionGrid>
            <ActionButton>
              <Ionicons name="map-outline" size={26} color="white" />
              <ActionLabel>Map</ActionLabel>
            </ActionButton>
            <ActionButton>
              <Ionicons name="calendar-outline" size={26} color="white" />
              <ActionLabel>Calendar</ActionLabel>
            </ActionButton>
          </ActionGrid>

          <SectionTitle>Friends going</SectionTitle>
          <FriendsSection>
            <AvatarStack>
              <Avatar source={{ uri: 'https://i.pravatar.cc/100?u=1' }} style={{ marginLeft: 0 }} />
              <Avatar source={{ uri: 'https://i.pravatar.cc/100?u=2' }} />
              <Avatar source={{ uri: 'https://i.pravatar.cc/100?u=3' }} />
            </AvatarStack>
            <DescriptionText>+ 2 friends going</DescriptionText>
          </FriendsSection>

          <LinkButton onPress={() => setModalVisible(true)}>
            <ButtonText>Link my ticket</ButtonText>
          </LinkButton>

          <View style={{ height: 50 }} />
        </ContentCard>
      </ScrollView>
    </Container>
  );
}
