import React from 'react';
import styled from 'styled-components';
import { Colors, Fonts } from '../../theme/theme';
import { latLngToPixelFromBounds } from './coordinates';

/* 1. Definir a interface do objeto Stage */
interface StageItem {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  rotation?: number;
  width?: number;
  height?: number;
}

/* 2. Definir a interface dos Bounds */
interface MapBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

/* 3. Tipar as Props do componente */
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
      style={{
        /* CORREÇÃO: Usar / 2 para garantir que o centro do palco bate no ponto GPS */
        left: pos.x - stageW / 2,
        top: pos.y - stageH / 2,
        width: stageW,
        height: stageH,
        transform: `rotate(${stage.rotation}deg)`,
      }}
      onClick={e => {
        e.stopPropagation();
        onPress();
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

  &:hover {
    background-color: rgba(146, 66, 204, 0.1);
  }
`;

const StageText = styled.span`
  color: ${Colors.palette.primary.light50};
  font-family: ${Fonts.family};
  font-weight: 600;
  font-size: 10px;
  text-align: center;
`;
