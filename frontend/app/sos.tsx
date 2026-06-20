import React, { useState } from 'react';
import styled from 'styled-components/native';
import { useRouter, Stack } from 'expo-router';
import { ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@clerk/expo';
import * as Location from 'expo-location';
import tags from '../data/tags.json';
import Head from 'expo-router/head';
import Header from '@/components/ui/header';
import api from '@/utils/api';

/* ---------------------- STYLES ---------------------- */

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding-vertical: ${({ theme }) => theme.spacing.xl}px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  align-items: center;
`;

const ContentWrapper = styled.View`
  flex: 1;
  justify-content: center;
  width: 100%;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
`;

const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.weights.semibold};
  font-size: ${({ theme }) => theme.text.titulo.h.fontSize}px;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  text-align: center;
`;

const TextStyled = styled.Text`
  font-family: ${({ theme }) => theme.fonts.weights.light};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  text-align: center;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
`;

const TagButton = styled.TouchableOpacity<{ selected: boolean }>`
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  margin: ${({ theme }) => theme.spacing.xs}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  background-color: ${({ selected, theme }) =>
    selected ? theme.colors.primary : theme.colors.white};
`;

const TagLabel = styled.Text<{ selected: boolean }>`
  font-size: ${({ theme }) => theme.text.botao.fontSize}px;
  line-height: ${({ theme }) => theme.text.botao.lineHeight}px;
  font-family: ${({ theme }) => theme.fonts.weights.light};
  color: ${({ selected, theme }) => (selected ? theme.colors.white : theme.colors.black)};
`;

const NotesInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.neutralGray};
  font-family: ${({ theme }) => theme.fonts.weights.light};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  border-radius: ${({ theme }) => theme.borderRadius.xlarge}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  min-height: 120px;
  width: 100%;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const CancelButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.white};
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
  height: 52px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  justify-content: center;
  align-items: center;
`;

const ConfirmButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary};
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
  height: 52px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  justify-content: center;
  align-items: center;
`;

const ButtonTextCancel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.weights.medium};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.text.botao.fontSize}px;
  text-align: center;
`;

const ButtonTextConfirm = styled.Text`
  font-family: ${({ theme }) => theme.fonts.weights.medium};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.text.botao.fontSize}px;
  text-align: center;
`;

/* ---------------------- COMPONENT ---------------------- */

export default function SOSForm() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [selected, setSelected] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (id: number) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    if (!isLoaded || !isSignedIn) {
      Alert.alert('Unable to send SOS', 'Please sign in before sending an SOS request.');
      return;
    }

    try {
      setIsSubmitting(true);
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          'Location required',
          'Please allow location access so the safety team and your friends know where you are.',
        );
        return;
      }

      const position =
        (await Location.getLastKnownPositionAsync()) ||
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }));
      const selectedLabels = tags.tags
        .filter(tag => selected.includes(tag.id))
        .map(tag => tag.label);
      const payload = {
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        description: notes.trim() || undefined,
        tag_selected: selectedLabels[0]?.slice(0, 32),
        options: {
          tags: selected,
          labels: selectedLabels,
          notes: notes.trim(),
        },
      };
      const token = await getToken({ skipCache: true });

      console.log('Payload pronto para enviar:', payload);
      await api.post('/sos', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      Alert.alert('SOS sent', 'Your request was sent successfully.');
      router.back();
    } catch (error) {
      console.error('Failed to send SOS:', error);
      Alert.alert('Unable to send SOS', 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelected([]);
    setNotes('');
    router.back();
  };

  return (
    <Container>
      <Head>
        <title>SOS | Safinity</title>
      </Head>
      <Header variant="back" />
      <Stack.Screen options={{ title: 'SOS | Safinity', headerShown: false }} />
      <ContentWrapper>
        <Title>Help us help you!</Title>
        <TextStyled>Add more information to your request for help.</TextStyled>

        <TagsContainer>
          {tags.tags.map(tag => (
            <TagButton
              key={tag.id}
              selected={selected.includes(tag.id)}
              onPress={() => toggleTag(tag.id)}
            >
              <TagLabel selected={selected.includes(tag.id)}>{tag.label}</TagLabel>
            </TagButton>
          ))}
        </TagsContainer>

        <NotesInput
          multiline
          placeholder="Write here any information you think we should know."
          value={notes}
          onChangeText={setNotes}
        />

        <ButtonRow>
          <CancelButton onPress={handleCancel}>
            <ButtonTextCancel>Cancel</ButtonTextCancel>
          </CancelButton>

          <ConfirmButton onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <ButtonTextConfirm>Confirm</ButtonTextConfirm>
            )}
          </ConfirmButton>
        </ButtonRow>
      </ContentWrapper>
    </Container>
  );
}
