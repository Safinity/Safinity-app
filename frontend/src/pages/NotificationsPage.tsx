import { useState } from 'react';
import styled from 'styled-components';
import notificationsData from '../data/notifications.json';

// --- Styled Components para o Layout ---

const PageContainer = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xl}px`};
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => `${theme.spacing.xl}px`};
`;

const Title = styled.h1`
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: ${({ theme }) => `${theme.text.titulo.h1.fontSize}px`};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
`;

const AddButton = styled.button<{ secondary?: boolean; isFullWidth?: boolean }>`
  background-color: ${({ theme, secondary }) => (secondary ? 'transparent' : theme.colors.primary)};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => `${theme.spacing.sm}px ${theme.spacing.md}px`};
  border-radius: ${({ theme }) => `${theme.borderRadius.small}px`};
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 500;
  border: ${({ secondary }) => (secondary ? '1px solid #444' : 'none')};
  cursor: pointer;

  /* Logica de tamanho para nao ficar gigante no Header */
  flex: ${({ isFullWidth }) => (isFullWidth ? 1 : 'none')};
  width: auto;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }
`;

// --- Styled Components para a Tabela ---

const NotificationTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
`;

const Th = styled.th`
  text-align: left;
  padding: ${({ theme }) => `0 ${theme.spacing.md}px`};
  color: ${({ theme }) => theme.colors.inactive};
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Tr = styled.tr`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
`;

const Td = styled.td`
  padding: ${({ theme }) => `${theme.spacing.md}px`};
  color: ${({ theme }) => theme.colors.white};
  font-family: 'Plus Jakarta Sans', sans-serif;

  &:first-child {
    border-radius: 8px 0 0 8px;
  }
  &:last-child {
    border-radius: 0 8px 8px 0;
  }
`;

const Badge = styled.span<{ type: string }>`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  background-color: ${({ type, theme }) =>
    type === 'emergency' ? theme.colors.error : theme.colors.palette.primary.dark40};
`;

// --- Styled Components para o Modal ---

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  padding: ${({ theme }) => `${theme.spacing.xl}px`};
  border-radius: ${({ theme }) => `${theme.borderRadius.medium}px`};
  width: 500px;
  max-width: 95%;
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => `${theme.spacing.md}px`};
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.inactive};
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const Input = styled.input`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px;
  color: white;
  border-radius: 6px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  &:focus {
    outline: 1px solid ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px;
  color: white;
  border-radius: 6px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  option {
    background: ${({ theme }) => theme.colors.grayNavbar};
  }
`;

const TextArea = styled.textarea`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px;
  color: white;
  border-radius: 6px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-height: 100px;
  resize: none;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

// --- Componente Principal ---

export const NotificationsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <PageContainer>
      <Header>
        <Title>Notification History</Title>
        <AddButton onClick={() => setIsModalOpen(true)}>+ New Notification</AddButton>
      </Header>

      <NotificationTable>
        <thead>
          <tr>
            <Th>Category</Th>
            <Th>Title</Th>
            <Th>Message</Th>
            <Th>Target Audience</Th>
            <Th>Date</Th>
          </tr>
        </thead>
        <tbody>
          {notificationsData.map(notif => (
            <Tr key={notif.id}>
              <Td>
                <Badge type={notif.type}>{notif.category}</Badge>
              </Td>
              <Td style={{ fontWeight: 600 }}>{notif.title}</Td>
              <Td style={{ opacity: 0.8, maxWidth: '400px' }}>{notif.message}</Td>
              <Td>{notif.target}</Td>
              <Td>{new Date(notif.sentAt).toLocaleDateString('en-GB')}</Td>
            </Tr>
          ))}
        </tbody>
      </NotificationTable>

      {isModalOpen && (
        <Overlay onClick={() => setIsModalOpen(false)}>
          <ModalContainer onClick={e => e.stopPropagation()}>
            <Title style={{ fontSize: '20px', marginBottom: '24px' }}>
              Create New Notification
            </Title>

            <FormGroup>
              <Label>Title</Label>
              <Input placeholder="Notification title" />
            </FormGroup>

            <FormGroup>
              <Label>Category</Label>
              <Select defaultValue="">
                <option value="" disabled>
                  Select a category
                </option>
                <option value="emergency">Security</option>
                <option value="crowd">Capacity</option>
                <option value="hydrate">Health</option>
                <option value="event">Schedule</option>
                <option value="activity">Logistics</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Target Audience</Label>
              <Input placeholder="e.g. All Attendees" />
            </FormGroup>

            <FormGroup>
              <Label>Message</Label>
              <TextArea placeholder="Describe the notification..." />
            </FormGroup>

            <ButtonGroup>
              <AddButton onClick={() => setIsModalOpen(false)} secondary isFullWidth>
                Cancel
              </AddButton>
              <AddButton onClick={() => setIsModalOpen(false)} isFullWidth>
                Send Notification
              </AddButton>
            </ButtonGroup>
          </ModalContainer>
        </Overlay>
      )}
    </PageContainer>
  );
};
