import React from 'react';
import { Image, TouchableOpacity } from 'react-native';

type Props = {
  width: number;
  height: number;
  theme: 'light' | 'dark';
  imageUrl?: string;
  onPress?: () => void;
};

export function StaticMapPreview({ width, height, theme, imageUrl, onPress }: Props) {
  if (!imageUrl) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Image
        key={`${theme}-${imageUrl}`}
        source={imageUrl ? { uri: imageUrl } : undefined}
        style={{ width, height }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}
