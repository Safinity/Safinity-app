import styled from 'styled-components';
import notificationsData from '../data/notifications.json';

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
  font-family: ${({ theme }) => theme.text.titulo.h1.fontFamily};
  font-size: ${({ theme }) => `${theme.text.titulo.h1.fontSize}px`};
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
`;

const AddButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => `${theme.spacing.sm}px ${theme.spacing.md}px`};
  border-radius: ${({ theme }) => `${theme.borderRadius.small}px`};
  font-family: ${({ theme }) => theme.text.botao.fontFamily};
  font-size: ${({ theme }) => `${theme.text.botao.fontSize}px`};
  border: none;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;

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
  padding: ${({ theme }) => `0 ${theme.spacing.md}px`};
  color: ${({ theme }) => theme.colors.inactive};
  font-family: ${({ theme }) => theme.text.textoPequeno.fontFamily};
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Tr = styled.tr`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
`;

const Td = styled.td`
  padding: ${({ theme }) => `${theme.spacing.md}px`};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  
  &:first-child {
    border-radius: ${({ theme }) => `${theme.borderRadius.small}px 0 0 ${theme.borderRadius.small}px`};
  }
  &:last-child {
    border-radius: ${({ theme }) => `0 ${theme.borderRadius.small}px ${theme.borderRadius.small}px 0`};
  }
`;

const Badge = styled.span<{ type: string }>`
  padding: 6px 12px;
  border-radius: ${({ theme }) => `${theme.borderRadius.round}px`};
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ type, theme }) => 
    type === 'emergency' 
      ? theme.colors.error 
      : theme.colors.palette.primary.dark40};
`;

export const NotificationsPage = () => {
  return (
    <PageContainer>
      <Header>
        <Title>Histórico de Notificações</Title>
        <AddButton>+ Nova Notificação</AddButton>
      </Header>

      <NotificationTable>
        <thead>
          <tr>
            <Th>Categoria</Th>
            <Th>Título</Th>
            <Th>Mensagem</Th>
            <Th>Público-Alvo</Th>
            <Th>Data</Th>
          </tr>
        </thead>
        <tbody>
          {notificationsData.map((notif) => (
            <Tr key={notif.id}>
              <Td>
                <Badge type={notif.type}>{notif.category}</Badge>
              </Td>
              <Td style={{ fontWeight: 600 }}>{notif.title}</Td>
              <Td style={{ opacity: 0.8, maxWidth: '400px' }}>
                {notif.message}
              </Td>
              <Td>{notif.target}</Td>
              <Td>{new Date(notif.sentAt).toLocaleDateString('pt-PT')}</Td>
            </Tr>
          ))}
        </tbody>
      </NotificationTable>
    </PageContainer>
  );
};