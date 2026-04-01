import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PhoneImg from '../assets/images/landing/phone.png';
import LogoImg from '../assets/images/landing/logo.png';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { Helmet } from 'react-helmet-async';

const Page = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;

  display: flex;
  align-items: center;
  padding: 0 80px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Content = styled.div`
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Logo = styled.img`
  width: 240px;
`;

const Title = styled.h1`
  font-size: 48px;
  line-height: 1.1;
  color: ${({ theme }) => theme.colors.white};
`;

const Subtitle = styled.p`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.white};
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  max-width: 320px;
`;

const PhoneWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const Phone = styled.img`
  height: 100vh;
  overflow-x: hidden;
  overflow-y: hidden;

  display: flex;
  align-items: center;
  padding: 0 80px;
`;

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Welcome to Safinity Backoffice!</title>
      </Helmet>

      <Page>
        <Content>
          <Logo src={LogoImg} alt="Safinity logo" />

          <div>
            <Title>Welcome to Safinity</Title>
            <Subtitle>Backoffice</Subtitle>
          </div>

          <Buttons>
            <PrimaryButton onClick={() => navigate('/login')}>Log in</PrimaryButton>

            <SecondaryButton onClick={() => navigate('/register')}>Create account</SecondaryButton>
          </Buttons>
        </Content>

        <PhoneWrapper>
          <Phone src={PhoneImg} alt="App preview" />
        </PhoneWrapper>
      </Page>
    </>
  );
}
