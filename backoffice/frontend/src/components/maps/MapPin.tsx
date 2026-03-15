import React from 'react';
import { latLngToPixelFromBounds } from './coordinates';
import { PIN_ICONS } from './constants';

/* Interface para os Bounds para evitar o erro de 'any' */
interface MapBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

/* Interface para o objeto Pin */
interface PinItem {
  id: string | number;
  lat: number;
  lng: number;
  type: 'food' | 'wc' | 'exit' | 'entrance';
}

interface MapPinProps {
  pin: PinItem;
  bounds: MapBounds; // Trocado de any para MapBounds
  width: number;
  height: number;
  onPress: (pin: PinItem) => void; // Trocado de any para PinItem
}

export const MapPin: React.FC<MapPinProps> = ({ pin, bounds, width, height, onPress }) => {
  const { x, y } = latLngToPixelFromBounds(pin.lat, pin.lng, bounds, width, height);

  return (
    <div
      onClick={() => onPress(pin)}
      style={{
        position: 'absolute',
        left: x - 14, // Offset horizontal (metade da largura)
        top: y - 40, // Offset vertical (altura total para a ponta do pin bater no local)
        width: 28,
        height: 40,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 5,
      }}
    >
      <img
        src={PIN_ICONS[pin.type]}
        alt={pin.type}
        style={{ width: 28, height: 40, objectFit: 'contain' }}
      />
    </div>
  );
};
