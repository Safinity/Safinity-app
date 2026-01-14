import '../theme/theme.css';
import styled from 'styled-components';

import Navbar from '../components/Navbar';
import HomeCard from '../components/HomeCard';
import imgCard from '../assets/image-home-card.png';

const Page = styled.div`
  min-height: 100vh;
  background-color: var(--background);
`;

const Content = styled.div`
  padding: 64px var(--spacing-margem-lateral);

  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
`;

export default function Home() {
  return (
    <Page>
      <Navbar userName="Jorge" avatarUrl="/Ellipse.png" />

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
