import React from 'react';
import { View, Image, Platform, Pressable } from 'react-native';
import { latLngToPixelFromBounds } from '../../utils/coordinates';
import { PIN_ICONS } from './constants';

export const MapPin = ({
  pin,
  avatar,
  bounds,
  width,
  height,
  onPress,
}: {
  pin: any;
  avatar?: any;
  bounds: any;
  width: number;
  height: number;
  onPress: (pin: any) => void;
}) => {
  const { x, y } = latLngToPixelFromBounds(pin.lat, pin.lng, bounds, width, height);

  return (
    <Pressable
      key={pin.id}
      onPress={() => onPress(pin)}
      style={{
        position: 'absolute',
        left: x - 14,
        top: y - 40,
        width: 28,
        height: 40,
        alignItems: 'center',
        justifyContent: 'flex-start',
        ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
      }}
    >
      {/* Pin image */}
      <Image
        source={PIN_ICONS[pin.type] || PIN_ICONS.friend}
        style={{
          width: 28,
          height: 40,
          resizeMode: 'contain',
        }}
      />

      {/* Avatar on top of pin */}
      {pin.type === 'friend' && avatar && (
        <Image
          source={avatar}
          style={{
            position: 'absolute',
            top: 3, // adjust to place avatar at the top of pin
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 1,
            borderColor: 'white',
          }}
        />
      )}
    </Pressable>
  );
};
