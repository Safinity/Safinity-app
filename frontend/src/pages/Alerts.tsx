import React from 'react';
import styled from 'styled-components';
import '../theme/theme.ts';

import alerts from '../data/alerts.json';
import { AlertsBar } from '../components/AlertBar';
import Navbar from '../components/Navbar';
import { theme } from '../theme/theme.ts';

export const Alerts: React.FC = () => {
  return (
    <Container>
      <Navbar userName="Jorge" avatarUrl="/Ellipse.png"></Navbar>

      <Title>Web Summit 2025</Title>
      <Subtitle>Alerts</Subtitle>

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
  background-color: ${({ theme }) => theme.colors.background};
  height: 100%;
`;

const Title = styled.h1`
  font-size: 30px;
  font-family: ${({ theme }) => theme.text.titulo.h1.fontFamily};  
  font-weight: 700;
  margin-bottom: 24px;
  color: #ffffff;
`;

const Subtitle = styled.h2`
  font-size: 18px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 150px 0 150px;
`;

export default Alerts;
