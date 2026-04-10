import '../theme/theme.ts';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HomeCard from '../components/HomeCard';
import imgCard from '../assets/image-home-card.png';
import imgCard2 from '../assets/image-home-card2.png';

const Page = styled.div`
  min-height: 100vh;
`;
const Content = styled.div`
  padding: 64px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
`;

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Home | Safinity Backoffice</title>
      </Helmet>
      <Page>
        <Content>
          <HomeCard
            title="Current events"
            description="See here the list of events you are associated with."
            image={imgCard}
            buttonLabel="See events"
            onClick={() => navigate('/events')}
          />

          <HomeCard
            title="New event"
            description="Create a new event and manage all its information here."
            image={imgCard2}
            buttonLabel="Add new event"
            onClick={() => console.log('Add new event')}
          />
        </Content>
      </Page>
    </>
  );
}
