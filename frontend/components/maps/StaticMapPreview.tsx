import React from 'react';
import { Image, TouchableOpacity, useColorScheme } from 'react-native';
import { getStaticMapUrl } from '../../api/mapbox';

type Props = {
  center: { lat: number; lng: number };
  width: number;
  height: number;
  onPress?: () => void;
};

export function StaticMapPreview({ center, width, height, onPress }: Props) {
  const theme = useColorScheme() === 'dark' ? 'dark' : 'light';

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
        source={{ uri: mapUrl }}
        style={{ width, height }} // ← scaled visually
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}
