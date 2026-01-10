import React from 'react';
import { Image } from 'react-native';
import { latLngToPixelFromBounds } from '../../utils/coordinates';
import { USER_ICON } from './constants';

export const UserMarker = ({
  location,
  bounds,
  width,
  height,
}: {
  location: { lat: number; lng: number };
  bounds: any;
  width: number;
  height: number;
}) => {
  const { x, y } = latLngToPixelFromBounds(location.lat, location.lng, bounds, width, height);
  return (
    <Image
      source={USER_ICON}
      style={{
        position: 'absolute',
        width: 31,
        height: 26,
        left: x - 12,
        top: y - 0,
      }}
    />
  );
};
