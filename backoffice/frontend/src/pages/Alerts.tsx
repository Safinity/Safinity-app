import React from 'react';
import styled from 'styled-components';
import '../theme/theme.ts';

import alerts from '../data/alerts.json';
import { AlertsBar } from '../components/AlertBar';

export const Alerts: React.FC = () => {
  return (
    <Container>

      <Content>
        <Title>Alerts</Title>
        <Subtitle>Web Summit 2025</Subtitle>

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
      </Content>
    </Container>
  );
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding-bottom: 40px;
`;

const Content = styled.div`
  margin: 40px 100px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.text.titulo.h1.fontSize};
  font-family: ${({ theme }) => theme.text.titulo.h1.fontFamily};
  margin-bottom: 0;
  color: ${({ theme }) => theme.colors.white};
`;

const Subtitle = styled.h3`
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize};
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  color: ${({ theme }) => theme.colors.primary_50};
  margin-top: 0;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export default Alerts;
