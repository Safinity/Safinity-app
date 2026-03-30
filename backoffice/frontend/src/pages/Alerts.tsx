/*
WCAG Level A Compliance for Alerts Page

Enhancements added:
- Skip link to jump to alerts list
- Roles and aria-labels for regions
- Each alert wrapped in a focusable div for keyboard navigation
- Keyboard focus support with visible outline (only for keyboard)
- Responsive content layout
- Screen reader announces updates
*/

import React, { useRef } from 'react';
import styled from 'styled-components';
import '../theme/theme.ts';

import alerts from '../data/alerts.json';
import { AlertsBar } from '../components/AlertBar';

export const Alerts: React.FC = () => {
  const listRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Skip link for keyboard users */}
      <SkipLink href="#alerts-list">Skip to alerts</SkipLink>

      <Container role="region" aria-label="Alerts section">
        <Content>
          <Title tabIndex={0}>Alerts</Title>
          <Subtitle>Web Summit 2025</Subtitle>

          <List id="alerts-list" ref={listRef}>
            {alerts.map((alert, index) => (
              <AlertItem
                key={alert.id}
                role="alert" // screen readers announce updates
                tabIndex={0} // keyboard focus
                aria-label={`${alert.type} alert: ${alert.title}. ${alert.message}. Submitted by ${alert.submittedby} at ${alert.time}`}
                data-index={index}
              >
                <AlertsBar
                  type={alert.type}
                  title={alert.title}
                  message={alert.message}
                  time={alert.time}
                  submittedby={alert.submittedby}
                />
              </AlertItem>
            ))}
          </List>
        </Content>
      </Container>
    </>
  );
};

/* Styled Components */
const SkipLink = styled.a`
  position: absolute;
  left: -999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
  z-index: 100;

  &:focus {
    left: 0;
    top: 0;
    width: auto;
    height: auto;
    padding: 8px 16px;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    font-weight: bold;
    text-decoration: none;
    z-index: 1000;
  }
`;

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding-bottom: 40px;
`;

const Content = styled.div`
  max-width: 1200px; /* Responsive width */
  margin: 0 auto;
  padding: 40px 20px; /* Mobile-friendly padding */
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.text.titulo.h1.fontSize};
  font-family: ${({ theme }) => theme.text.titulo.h1.fontFamily};
  margin-bottom: 0;
  color: ${({ theme }) => theme.colors.white};
  outline: none;

  /* Only show outline when focused via keyboard */
  &:focus-visible {
    outline: 2px dashed ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Subtitle = styled.h2`
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize};
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  color: ${({ theme }) => theme.colors.primary_50};
  margin-top: 0;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md}px; /* Consistent spacing */
`;

/* Focusable wrapper around each alert for keyboard accessibility */
const AlertItem = styled.div`
  outline: none;

  /* Show outline only when keyboard focusing (tabbing) */
  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export default Alerts;
