import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  return (
    <>
      <Wrapper $open={open}>
        <CloseButton onClick={onClose}>×</CloseButton>

        <Menu>
          <MenuItem to="/home" onClick={onClose}>
            Home
          </MenuItem>
          <MenuItem to="/dashboards" onClick={onClose}>
            Manage event
          </MenuItem>
          <MenuItem to="/mupis" onClick={onClose}>
            Mupis
          </MenuItem>
          <MenuItem to="/alerts" onClick={onClose}>
            Alerts
          </MenuItem>
          <MenuItem to="/notifications" onClick={onClose}>
            Notifications
          </MenuItem>
        </Menu>
      </Wrapper>

      {open && <Overlay onClick={onClose} />}
    </>
  );
};

const Wrapper = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  padding: ${({ theme }) => theme.spacing.lg}px;
  transform: translateX(${({ $open }) => ($open ? '0' : '-100%')});
  transition: transform 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.palette.primary.light80};
  font-size: 32px;
  cursor: pointer;
  align-self: flex-end;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const Menu = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
`;

const MenuItem = styled(Link)`
  color: ${({ theme }) => theme.colors.white};
  font-size: 18px;
  text-decoration: none;
  font-family: ${({ theme }) => theme.text.textoFiltros.fontFamily};
  &:hover {
    color: ${({ theme }) => theme.colors.primary_50};
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  z-index: 900;
`;
