import React, { useState } from 'react';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import tags from '../data/tags.json';

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
  const [selected, setSelected] = useState<number[]>([]);
  const [notes, setNotes] = useState('');

  const toggleTag = (id: number) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    const payload = { tags: selected, notes: notes.trim() };
    try {
      console.log('Payload pronto para enviar:', payload);
      // enviar para backend aqui
    } catch (error) {
      console.error(error);
    }
    router.back();
  };

  const handleCancel = () => {
    setSelected([]);
    setNotes('');
    router.back();
  };

  return (
    <Container>
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

          <ConfirmButton onPress={handleSubmit}>
            <ButtonTextConfirm>Confirm</ButtonTextConfirm>
          </ConfirmButton>
        </ButtonRow>
      </ContentWrapper>
    </Container>
  );
}
