import styled from 'styled-components';
import logoNavbar from '../assets/logo-navbar.png';

interface NavbarProps {
  userName: string;
  avatarUrl?: string;
}

const Container = styled.div`
  width: 100%;
  height: 64px;
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
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

export default function Navbar({ userName, avatarUrl }: NavbarProps) {
  return (
    <Container>
      <LogoImage src={logoNavbar} alt="Safinity logo" />

      <UserArea>
        <HelloText>Hello! {userName}</HelloText>
        {avatarUrl && <Avatar src={avatarUrl} alt="avatar" />}
      </UserArea>
    </Container>
  );
}
