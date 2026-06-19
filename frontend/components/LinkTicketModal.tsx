import { useAuth } from '@clerk/expo';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, TextInput } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { linkUserTicket, type UserTicket } from '../utils/tickets';

type LinkTicketModalProps = {
  visible: boolean;
  eventId?: string | string[];
  onClose: () => void;
  onLinked?: (ticket: UserTicket) => void;
};

export function LinkTicketModal({ visible, eventId, onClose, onLinked }: LinkTicketModalProps) {
  const theme = useTheme();
  const { isSignedIn, getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  const [ticketCode, setTicketCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  getTokenRef.current = getToken;

  useEffect(() => {
    if (!visible) {
      setTicketCode('');
      setError('');
      setSuccess('');
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleCodeChange = (value: string) => {
    setTicketCode(value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    if (!isSignedIn) {
      setError('Please sign in to link a ticket.');
      return;
    }

    if (ticketCode.length !== 6) {
      setError('Enter the 6-character validation code.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const token = await getTokenRef.current();
      const response = await linkUserTicket(token, ticketCode, eventId);
      setSuccess('Ticket linked successfully.');
      onLinked?.(response.data);

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (linkError: any) {
      setError(linkError?.response?.data?.message || 'Unable to link ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <ModalOverlay>
        <ModalContent>
          <ModalTitle>Link my ticket</ModalTitle>
          <ModalDescription>
            Your ticket has a 6-character validation code. Enter that code below.
          </ModalDescription>

          <TicketCodeInput
            value={ticketCode}
            onChangeText={handleCodeChange}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="ABC123"
            placeholderTextColor={theme.colors.textSubtle}
            editable={!isSubmitting}
            accessible
            accessibilityLabel="6-character ticket validation code"
          />

          {error ? <FeedbackText isError>{error}</FeedbackText> : null}
          {success ? <FeedbackText>{success}</FeedbackText> : null}

          <ModalButtons>
            <ModalBtn onPress={onClose} disabled={isSubmitting}>
              <ModalBtnText>Cancel</ModalBtnText>
            </ModalBtn>

            <ModalBtn isPrimary onPress={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <ModalBtnText isPrimary>Link</ModalBtnText>
              )}
            </ModalBtn>
          </ModalButtons>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
}

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

const ModalContent = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  width: 95%;
  border-radius: ${({ theme }) => theme.borderRadius.xlarge}px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  align-items: center;
`;

const ModalTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.text.titulo.h.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h.fontSize}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const ModalDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  line-height: ${({ theme }) => theme.text.corpo.corpoTexto.lineHeight}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const TicketCodeInput = styled(TextInput)`
  width: 100%;
  height: 54px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.text.titulo.h2.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h2.fontSize}px;
  text-align: center;
  letter-spacing: 0px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const FeedbackText = styled.Text<{ isError?: boolean }>`
  color: ${({ isError, theme }) => (isError ? theme.colors.error : theme.colors.palette.secondary.turquoise)};
  font-family: ${({ theme }) => theme.text.label.fontFamily};
  font-size: ${({ theme }) => theme.text.label.fontSize}px;
  line-height: ${({ theme }) => theme.text.label.lineHeight}px;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const ModalButtons = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const ModalBtn = styled.TouchableOpacity<{ isPrimary?: boolean }>`
  flex: 0.48;
  min-height: 52px;
  background-color: ${({ isPrimary, theme }) =>
    isPrimary ? theme.colors.primary : theme.colors.surfaceSoft};
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  align-items: center;
  justify-content: center;
`;

const ModalBtnText = styled.Text<{ isPrimary?: boolean }>`
  font-family: ${({ theme }) => theme.text.botao.fontFamily};
  font-size: ${({ theme }) => theme.text.botao.fontSize}px;
  color: ${({ isPrimary, theme }) => (isPrimary ? theme.colors.onPrimary : theme.colors.primary)};
`;
