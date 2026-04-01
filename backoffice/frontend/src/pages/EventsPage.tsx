// src/pages/EventsPage.tsx
import React from 'react';
import styled from 'styled-components';
import { EventCard } from '../components/EventCards';
import eventData from '../data/events.json';
import { Helmet } from 'react-helmet-async';

const EventsPage: React.FC = () => {
  return (
    <>
    <Helmet>
        <title>Events | Safinity Backoffice</title>
      </Helmet>
      <PageWrapper>
        <Header>
          <Title>Events List</Title>
          <Subtitle>
            Here are all the events you are associated with. Click on one of them to get more
            details.
          </Subtitle>
        </Header>

        <GridContainer>
          {eventData.events.map(event => (
            <EventCard key={event.id} event={event} variant="default" />
          ))}
        </GridContainer>
      </PageWrapper>
    </>
  );
};

export default EventsPage;

/* --- Styled Components usando o theme CSS --- */

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--background);
  padding: var(--spacing-xl);

  @media (min-width: 1024px) {
    padding-left: var(--spacing-margem-lateral);
  }
`;

const Header = styled.header`
  max-width: 1200px;
  margin: 0 auto 48px auto;
`;

const Title = styled.h1`
  color: var(--white);
  font-size: 48px;
  font-weight: var(--weight-semibold);
  margin: 0 0 16px 0;
  letter-spacing: -1px;
  font-family: var(--font-family);
`;

const Subtitle = styled.p`
  color: var(--inactive);
  font-size: 18px;
  max-width: 600px;
  line-height: 1.6;
  margin: 0;
  font-family: var(--font-family);
`;

const GridContainer = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 32px;
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;
