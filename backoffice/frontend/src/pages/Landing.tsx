import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PhoneImg from '../assets/images/landing/phone.png';
import LogoImg from '../assets/images/landing/logo.png';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { Helmet } from 'react-helmet-async';

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
            <PrimaryButton
              aria-label="Log in to your Safinity account"
              onClick={() => navigate('/login')}
            >
              Log in
            </PrimaryButton>

            <SecondaryButton
              aria-label="Create a new Safinity account"
              onClick={() => navigate('/register')}
            >
              Create account
            </SecondaryButton>
          </Buttons>
        </Content>

        <PhoneWrapper>
          <Phone src={PhoneImg} alt="" aria-hidden="true" />
        </PhoneWrapper>
      </Page>
    </>
  );
}

const Page = styled.main`
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

const Subtitle = styled.h2`
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
  align-self: stretch;
  overflow: hidden;
`;

const Phone = styled.img`
  height: 100%;
  object-fit: contain;
  object-position: bottom;
`;
