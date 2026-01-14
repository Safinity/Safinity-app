import styled from 'styled-components';
import logoNavbar from '../assets/logo-navbar.png';



interface NavbarProps {
  userName: string;
  avatarUrl?: string;
  onMenuClick?: () => void;
}

const Container = styled.div`
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  padding: 0 100px;
`;

const LogoImage = styled.img`
  height: 20px;
  width: auto;
  object-fit: contain;
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
`;

const HelloText = styled.span`
  margin-right: 8px;
  color: #ffffff;
  font-family: ${({ theme }) => theme.text.textoPequeno.fontFamily};
  font-size: ${({ theme }) => theme.text.textoPequeno.fontSize}px;
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  object-fit: cover;
`;

const Hamburger = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  font-size: 26px;
  cursor: pointer;
`;


export default function Navbar({ userName, avatarUrl, onMenuClick }: NavbarProps) {
  return (
    <Container>
      <Hamburger onClick={onMenuClick}>☰</Hamburger>

      <LogoImage src={logoNavbar} alt="Safinity logo" />

      <UserArea>
        <HelloText>Hi, {userName}!</HelloText>
        {avatarUrl && <Avatar src={avatarUrl} alt="avatar" />}
      </UserArea>
    </Container>
  );
}
