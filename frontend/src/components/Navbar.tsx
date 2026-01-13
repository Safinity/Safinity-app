import styled from 'styled-components';
import logoNavbar from '../assets/logo-navbar.png';

interface NavbarProps {
  userName: string;
  avatarUrl?: string;
}

const Container = styled.div`
  width: 100%;
  height: 64px;
  background-color: var(--gray-navbar);

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 var(--spacing-margem-lateral);
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
  margin-right: var(--spacing-sm);
  color: var(--white);

  font-family: var(--text-pequeno-font);
  font-size: var(--text-pequeno-size);
  line-height: var(--text-pequeno-line-height);
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-round);
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
