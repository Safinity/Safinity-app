import type { ImageSourcePropType } from 'react-native';

export function getUserImageUri(image?: string | null) {
  if (!image || image === 'default') {
    return null;
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  return null;
}

export function getUserImageSource(image?: string | null): ImageSourcePropType | null {
  const uri = getUserImageUri(image);

  return uri ? { uri } : null;
}
