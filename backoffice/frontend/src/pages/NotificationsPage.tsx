import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import initialData from '../data/notifications.json';
import { Helmet } from 'react-helmet-async';

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding-bottom: 40px;
  min-height: 100vh;
`;

const Content = styled.div`
  margin: 40px 100px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.text.titulo.h1.fontSize};
  font-family: ${({ theme }) => theme.text.titulo.h1.fontFamily};
  margin-bottom: 0;
  color: ${({ theme }) => theme.colors.white};
`;

const Subtitle = styled.h2`
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize};
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  color: ${({ theme }) => theme.colors.primary_50};
  margin-top: 0;
`;

const ActionButton = styled.button<{
  variant?: 'primary' | 'white' | 'ghost';
  isFullWidth?: boolean;
}>`
  padding: 12px 24px;
  border-radius: ${({ theme }) => `${theme.borderRadius.small}px`};
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  flex: ${({ isFullWidth }) => (isFullWidth ? 1 : 'none')};

  ${({ variant, theme }) => {
    switch (variant) {
      case 'white':
        return `background-color: ${theme.colors.white}; color: ${theme.colors.background};`;
      default:
        return `background-color: ${theme.colors.primary}; color: ${theme.colors.white};`;
    }
  }}

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const NotificationTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
`;

const Th = styled.th`
  text-align: left;
  padding: 0 16px;
  color: ${({ theme }) => theme.colors.inactive};
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Tr = styled.tr`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
`;

const Td = styled.td`
  padding: 18px 16px;
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
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ type, theme }) =>
    type === 'emergency' ? '#A83232' : theme.colors.palette.primary.dark40};
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  padding: 40px;
  border-radius: 16px;
  width: 550px;
  max-width: 90%;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #c4c4c8;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const Input = styled.input`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 14px;
  color: white;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 14px;
  color: white;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const TextArea = styled.textarea`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 14px;
  color: white;
  border-radius: 8px;
  min-height: 100px;
  resize: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  /* adicionar o mesmo focus que o Input tem */
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 32px;
`;

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    message: '',
    target: '',
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      modalRef.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus();
    }
  }, [isModalOpen]);

  const handleClose = () => {
    setIsModalOpen(false);
    openButtonRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSend = () => {
    if (!formData.title || !formData.message || !formData.category || !formData.target) {
      return alert('Please fill in all fields');
    }
    const newNotification = {
      id: (notifications.length + 1).toString(),
      type: formData.category,
      category: formData.category.charAt(0).toUpperCase() + formData.category.slice(1),
      title: formData.title,
      message: formData.message,
      sentAt: new Date().toISOString(),
      target: formData.target,
      reach: 0,
    };
    setNotifications([newNotification, ...notifications]);
    handleClose();
    setFormData({ title: '', category: '', message: '', target: '' });
  };

  return (
    <>
      <Helmet>
        <title>Notifications | Safinity Backoffice</title>
      </Helmet>

      <Container>
        <Content>
          <Header>
            <div>
              <Title>Notification History</Title>
              <Subtitle>Web Summit 2025</Subtitle>
            </div>
            <ActionButton
              ref={openButtonRef}
              onClick={() => setIsModalOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isModalOpen}
            >
              + New Notification
            </ActionButton>
          </Header>

          <NotificationTable aria-label="Notification history">
            <thead>
              <tr>
                <Th scope="col">Category</Th>
                <Th scope="col">Title</Th>
                <Th scope="col">Message</Th>
                <Th scope="col">Target Audience</Th>
                <Th scope="col">Date</Th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(notif => (
                <Tr key={notif.id}>
                  <Td>
                    <Badge type={notif.type}>{notif.category}</Badge>
                  </Td>
                  <Td style={{ fontWeight: 600 }}>{notif.title}</Td>
                  <Td
                    style={{
                      color: '#C4C4C8',
                      maxWidth: '400px',
                      fontSize: '14px',
                      fontWeight: 300,
                    }}
                  >
                    {notif.message}
                  </Td>
                  <Td style={{ fontSize: '14px' }}>{notif.target}</Td>
                  <Td style={{ fontSize: '14px', color: '#C4C4C8', fontWeight: 300 }}>
                    {new Date(notif.sentAt).toLocaleDateString('en-GB')}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </NotificationTable>
        </Content>

        {isModalOpen && (
          <Overlay onClick={handleClose}>
            <ModalContainer
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              onClick={e => e.stopPropagation()}
            >
              <Title id="modal-title" style={{ fontSize: '24px', marginBottom: '32px' }}>
                Create Notification
              </Title>

              <FormGroup>
                <Label htmlFor="notif-title">Notification Title</Label>
                <Input
                  id="notif-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Welcome to the Arena"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="notif-category">Category</Label>
                <Select
                  id="notif-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option value="emergency">Emergency / Security</option>
                  <option value="crowd">Capacity / Crowd Control</option>
                  <option value="event">Event Update</option>
                  <option value="promo">Partners / Promos</option>
                  <option value="logistics">Logistics / Shuttle</option>
                  <option value="health">Health / Hydration</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="notif-target">Target Audience</Label>
                <Input
                  id="notif-target"
                  name="target"
                  value={formData.target}
                  onChange={handleInputChange}
                  placeholder="Ex: All Attendees, VIP, Speakers..."
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="notif-message">Message Content</Label>
                <TextArea
                  id="notif-message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="What do you want to broadcast?"
                />
              </FormGroup>

              <ButtonGroup>
                <ActionButton variant="white" isFullWidth onClick={handleClose}>
                  Cancel
                </ActionButton>
                <ActionButton variant="primary" isFullWidth onClick={handleSend}>
                  Send Notification
                </ActionButton>
              </ButtonGroup>
            </ModalContainer>
          </Overlay>
        )}
      </Container>
    </>
  );
};
