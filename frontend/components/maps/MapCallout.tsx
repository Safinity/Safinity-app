import React from 'react';
import styled from 'styled-components/native';
import { Colors, BorderRadius, Spacing, Fonts } from '../../constants/theme';

const Container = styled.View<{ x: number; y: number }>`
  position: absolute;
  /* Centers the 160px bubble over the pin pixel */
  left: ${props => props.x - 80}px;
  top: ${props => props.y - 125}px;
  width: 160px;
  background-color: ${Colors.palette.primary.light90};
  border-radius: ${BorderRadius.medium}px;
  padding: ${Spacing.md}px;
  align-items: center;
  z-index: 1000;
  shadow-color: ${Colors.black};
  shadow-opacity: 0.2;
  shadow-radius: 4px;
  elevation: 5;
`;

const Title = styled.Text`
  font-family: ${Fonts.weights.bold};
  font-size: ${Fonts.sizes.base}px;
  color: ${Colors.palette.primary.dark80};
  margin-bottom: ${Spacing.sm}px;
  text-align: center;
`;

const RotaButton = styled.TouchableOpacity`
  background-color: ${Colors.palette.primary.normal};
  padding: 8px 20px;
  border-radius: ${BorderRadius.round}px;
`;

const RotaText = styled.Text`
  color: ${Colors.white};
  font-family: ${Fonts.weights.semibold};
  font-size: ${Fonts.sizes.sm}px;
`;

const Triangle = styled.View`
  width: 0;
  height: 0;
  background-color: transparent;
  border-left-width: 10px;
  border-right-width: 10px;
  border-top-width: 12px;
  border-left-color: transparent;
  border-right-color: transparent;
  border-top-color: ${Colors.palette.primary.light90};
  position: absolute;
  bottom: -10px;
`;

interface MapCalloutProps {
  x: number;
  y: number;
  title: string;
  onPressRoute: () => void;
}

export const MapCallout = ({ x, y, title, onPressRoute }: MapCalloutProps) => (
  <Container x={x} y={y}>
    <Title numberOfLines={1}>{title}</Title>
    <RotaButton onPress={onPressRoute}>
      <RotaText>Directions</RotaText>
    </RotaButton>
    <Triangle />
  </Container>
);
