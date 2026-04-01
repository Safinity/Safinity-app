import React from 'react';
import styled from 'styled-components';
import { latLngToPixelFromBounds } from './coordinates';
import { PIN_ICONS } from './constants';
import { theme } from '../../theme/theme';

interface MapBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

interface PinItem {
  id: string | number;
  lat: number;
  lng: number;
  type: 'food' | 'wc' | 'exit' | 'entrance';
}

interface MapPinProps {
  pin: PinItem;
  bounds: MapBounds;
  width: number;
  height: number;
  onPress: (pin: PinItem) => void;
  ariaLabel?: string;
}

export const MapPin: React.FC<MapPinProps> = ({
  pin,
  bounds,
  width,
  height,
  onPress,
  ariaLabel,
}) => {
  const { x, y } = latLngToPixelFromBounds(pin.lat, pin.lng, bounds, width, height);

  return (
    <PinWrapper
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || `${pin.type} pin: ${pin.id}`}
      style={{ left: x - 14, top: y - 40 }}
      onClick={() => onPress(pin)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPress(pin);
        }
      }}
    >
      <img
        src={PIN_ICONS[pin.type]}
        alt="" // decorative: aria-label handles screen readers
      />
    </PinWrapper>
  );
};

/* ---------------- STYLED COMPONENT ---------------- */

const PinWrapper = styled.div`
  position: absolute;
  width: 28px;
  height: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  outline: none;

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  img {
    width: 28px;
    height: 40px;
    object-fit: contain;
    pointer-events: none; /* allows div focus/click to work */
  }
`;
