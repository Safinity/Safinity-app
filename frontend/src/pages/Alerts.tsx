import React from 'react';
import styled from 'styled-components';
import '../theme/theme.ts';

import alerts from '../data/alerts.json';
import { AlertsBar } from '../components/AlertBar';
import Navbar from '../components/Navbar';

export const Alerts: React.FC = () => {
  return (
    <Container>
      <Navbar userName="Jorge" avatarUrl="/Ellipse.png"></Navbar>

      <Title>Alerts</Title>

      <List>
        {alerts.map(alert => (
          <AlertsBar
            key={alert.id}
            type={alert.type}
            dotColor={alert.dotColor}
            title={alert.title}
            message={alert.message}
            time={alert.time}
            submittedby={alert.submittedby}
          />
        ))}
      </List>
    </Container>
  );
};

const Container = styled.div`
  background-color: #222734;
  height: 100%;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #ffffff;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 150px 0 150px;
`;

export default Alerts;
