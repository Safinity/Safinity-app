import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { getStaticMapUrl } from '../../api/mapbox';

type Props = {
  center: { lat: number; lng: number };
  width: number;
  height: number;
  theme: 'light' | 'dark';
  onPress?: () => void;
};

export function StaticMapPreview({ center, width, height, theme, onPress }: Props) {
  const STATIC_WIDTH = 1024;
  const STATIC_HEIGHT = 1024;

  const mapUrl = getStaticMapUrl({
    center,
    width: STATIC_WIDTH,
    height: STATIC_HEIGHT,
    theme,
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Image
        key={theme} // Add a 'key' here to force the Image to reload when theme changes
        source={{ uri: mapUrl }}
        style={{ width, height }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}
