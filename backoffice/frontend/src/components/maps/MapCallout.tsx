import React from 'react';
import styled from 'styled-components';
import { Colors, BorderRadius, Spacing, Fonts } from '../../theme/theme';

interface MapCalloutProps {
  x: number;
  y: number;
  title: string;
  onPressRoute?: () => void; // optional click handler
}

export const MapCallout: React.FC<MapCalloutProps> = ({ x, y, title, onPressRoute }) => {
  return (
    <Container style={{ left: x - 80, top: y - 125 }} onClick={onPressRoute}>
      <Title>{title}</Title>
      <Triangle />
    </Container>
  );
};

/* --- Styled Components --- */
const Container = styled.div`
  position: absolute;
  width: 160px;
  background-color: ${Colors.palette.primary.light90};
  border-radius: ${BorderRadius.medium}px;
  padding: ${Spacing.md}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  cursor: pointer;
`;

const Title = styled.div`
  font-family: ${Fonts.weights.bold};
  font-size: ${Fonts.sizes.base}px;
  color: ${Colors.palette.primary.dark80};
  margin-bottom: ${Spacing.sm}px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Triangle = styled.div`
  width: 0;
  height: 0;
  background-color: transparent;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 12px solid ${Colors.palette.primary.light90};
  position: absolute;
  bottom: -10px;
`;
