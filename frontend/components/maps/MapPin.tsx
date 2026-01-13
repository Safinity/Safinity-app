import React from 'react';
import { Image, ImageBackground } from 'react-native';
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
    <ImageBackground
      key={pin.id}
      source={PIN_ICONS[pin.type] || PIN_ICONS.friend}
      // ImageBackground requires the style for the container
      // and imageStyle for the actual image properties
      style={{
        position: 'absolute',
        width: 28,
        height: 40,
        left: x - 14,
        top: y - 40,
        alignItems: 'center', // Centers the avatar horizontally
      }}
      imageStyle={{
        resizeMode: 'contain',
      }}
      onTouchEnd={() => onPress(pin)}
    >
      {/* Now we can safely nest the avatar face inside */}
      {pin.type === 'friend' && avatar && (
        <Image
          source={avatar}
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            marginTop: 4, // Pushes face into the circular top of the pin
          }}
        />
      )}
    </ImageBackground>
  );
};
