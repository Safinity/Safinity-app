import React from 'react';
import { Image } from 'react-native';
import { latLngToPixelFromBounds } from '../../utils/coordinates';
import { PIN_ICONS } from './constants';

export const MapPin = ({
  pin,
  bounds,
  width,
  height,
  onPress,
}: {
  pin: any;
  bounds: any;
  width: number;
  height: number;
  onPress: (pin: any) => void;
}) => {
  const { x, y } = latLngToPixelFromBounds(pin.lat, pin.lng, bounds, width, height);
  return (
    <Image
      key={pin.id}
      source={PIN_ICONS[pin.type] || PIN_ICONS.friend}
      style={{
        position: 'absolute',
        width: 32,
        height: 42,
        left: x - 16,
        top: y - 42,
      }}
      onTouchEnd={() => onPress(pin)}
    />
  );
};