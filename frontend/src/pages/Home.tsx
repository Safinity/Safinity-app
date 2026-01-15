import '../theme/theme.ts';
import styled from 'styled-components';

import HomeCard from '../components/HomeCard';
import imgCard from '../assets/image-home-card.png';

const Page = styled.div`
  min-height: 100vh;
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


const Content = styled.div`
  padding: 64px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
`;

export default function Home() {
  return (
    <Page>
      <Content>
        <HomeCard
          title="Current events"
          description="See here the list of events you are associated with."
          image={imgCard}
          buttonLabel="See events"
          onClick={() => (window.location.href = '/events')}
        />

        <HomeCard
          title="New event"
          description="Create a new event and manage all its information here."
          image={imgCard}
          buttonLabel="Add new event"
          onClick={() => console.log('Add new event')}
        />
      </Content>
    </Page>
  );
}
