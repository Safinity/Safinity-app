import { useState } from 'react';
import styled from 'styled-components';
import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';
import '../theme/theme.css';
import { Link } from 'react-router-dom';


const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
`;
const LinkButton = styled(Link)`
  display: inline-block;
  background-color: var(--secondary-icy-blue);
  color: var(--white);
  border-radius: var(--radius-small);
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: var(--text-botao-font);
  font-size: var(--text-botao-size);
  line-height: var(--text-botao-line-height);
  text-decoration: none;
  margin-top: 1rem;

  &:hover {
    filter: brightness(1.1);
  }
`;


const Logo = styled.img`
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;

  &:hover {
    filter: drop-shadow(0 0 2em var(--primary-normal));
  }
`;

const ReactLogo = styled(Logo)`
  &:hover {
    filter: drop-shadow(0 0 2em var(--secondary-icy-blue));
  }
`;

const Title = styled.h1`
  color: var(--primary-normal);
  font-family: var(--font-family);
  font-size: var(--title-h-size);
`;

const Card = styled.div`
  background-color: var(--gray-navbar);
  padding: 2em;
  border-radius: var(--radius-medium);
  color: var(--white);
  margin-top: 2rem;
`;

const Button = styled.button`
  background-color: var(--primary-normal);
  color: var(--white);
  border-radius: var(--radius-small);
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: var(--text-botao-font);
  font-size: var(--text-botao-size);
  line-height: var(--text-botao-line-height);
  border: none;
  cursor: pointer;

  &:hover {
    filter: brightness(1.1);
  }
`;

const Text = styled.p<{ color?: string }>`
  color: ${(props) => props.color || 'var(--white)'};
  margin-top: 1rem;
`;

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <Container>
      <div>
        <a href="https://vite.dev" target="_blank">
          <Logo src={viteLogo} alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <ReactLogo src={reactLogo} alt="React logo" />
        </a>
      </div>

      <Title>Vite + React</Title>

      <Card>
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <Text>
          Edit <code>src/App.tsx</code> and save to test HMR
        </Text>
          <LinkButton to="/mupis">
    Ir para Mupis
  </LinkButton>

      </Card>

      <Text color="var(--neutral60)">
        Click on the Vite and React logos to learn more
      </Text>
    </Container>
  );
}
