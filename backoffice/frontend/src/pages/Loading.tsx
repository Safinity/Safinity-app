import { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Logo from '../assets/logos/loading-logo.png';
import { Helmet } from 'react-helmet-async';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoImg = styled.img`
  height: 140px;
  animation: ${fadeIn} 1.2s ease forwards;
`;

type Props = {
  onFinish: () => void;
};

export default function Loading({ onFinish }: Props) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <>
      <Helmet>
        <title>Entering Safinity Backoffice...</title>
      </Helmet>

      <Container>
        <LogoImg src={Logo} alt="Loading logo" />
      </Container>
    </>
  );
}
