import React from 'react';
import styled from 'styled-components';
import { Colors, Fonts } from '../../theme/theme';
import { latLngToPixelFromBounds } from './coordinates';

interface StageItem {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  rotation?: number;
  width?: number;
  height?: number;
}

interface MapBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

interface MapStageProps {
  stage: StageItem;
  bounds: MapBounds;
  width: number;
  height: number;
  onPress: () => void;
}

export const MapStage: React.FC<MapStageProps> = ({ stage, bounds, width, height, onPress }) => {
  const pos = latLngToPixelFromBounds(stage.lat, stage.lng, bounds, width, height);
  const stageW = stage.width || 90;
  const stageH = stage.height || 60;

  return (
    <StageBox
      role="button"
      tabIndex={0}
      aria-label={`Stage: ${stage.name}`}
      style={{
        left: pos.x - stageW / 2,
        top: pos.y - stageH / 2,
        width: stageW,
        height: stageH,
        transform: `rotate(${stage.rotation || 0}deg)`,
      }}
      onClick={e => {
        e.stopPropagation();
        onPress();
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPress();
        }
      }}
    >
      <StageText>{stage.name}</StageText>
    </StageBox>
  );
};

/* --- Styled Components --- */

const StageBox = styled.div`
  position: absolute;
  background-color: rgba(0, 0, 0, 0);
  border: 1.5px solid ${Colors.palette.primary.light50};
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  pointer-events: auto;
  z-index: 10;
  outline: none;

  &:hover {
    background-color: rgba(146, 66, 204, 0.1);
  }

  &:focus-visible {
    outline: 2px solid ${Colors.palette.primary.main};
    outline-offset: 2px;
  }
`;

const StageText = styled.span`
  color: ${Colors.palette.primary.light50};
  font-family: ${Fonts.family};
  font-weight: 600;
  font-size: 10px;
  text-align: center;
`;
