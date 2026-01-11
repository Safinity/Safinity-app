import React from 'react';
import styled from 'styled-components/native';
import { Colors, Fonts } from '../../constants/theme';
import { latLngToPixelFromBounds } from '../../utils/coordinates';

// Styled component using dynamic dimensions
const StageBox = styled.TouchableOpacity<{
  $x: number;
  $y: number;
  $rotation: number;
  $w: number;
  $h: number;
}>`
  position: absolute;
  /* Centers the box by subtracting half its width/height from the pixel coordinate */
  left: ${props => props.$x - props.$w / 2}px;
  top: ${props => props.$y - props.$h / 2}px;
  width: ${props => props.$w}px;
  height: ${props => props.$h}px;

  background-color: rgba(0, 0, 0, 0);
  border-width: 1.5px;
  border-color: ${Colors.palette.primary.light50};
  border-radius: 4px;

  justify-content: center;
  align-items: center;
  /* Applies the rotation from your JSON */
  transform: rotate(${props => props.$rotation}deg);
`;

const StageText = styled.Text`
  color: ${Colors.palette.primary.light50};
  font-family: ${Fonts.weights.semibold};
  font-size: 10px;
  text-align: center;
`;

interface StageProps {
  stage: {
    id: string | number;
    name: string;
    lat: number;
    lng: number;
    rotation: number;
    width?: number; // Optional: comes from JSON
    height?: number; // Optional: comes from JSON
  };
  bounds: any;
  width: number; // Map width
  height: number; // Map height
  onPress: () => void;
}

export const MapStage = ({ stage, bounds, width, height, onPress }: StageProps) => {
  const pos = latLngToPixelFromBounds(stage.lat, stage.lng, bounds, width, height);

  // Logic: Use JSON size if provided, otherwise fallback to standard defaults
  const stageW = stage.width || 90;
  const stageH = stage.height || 60;

  return (
    <StageBox
      $x={pos.x}
      $y={pos.y}
      $w={stageW}
      $h={stageH}
      $rotation={stage.rotation}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <StageText>{stage.name}</StageText>
    </StageBox>
  );
};
