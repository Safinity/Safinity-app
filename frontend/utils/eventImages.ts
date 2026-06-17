import type { ImageSourcePropType } from 'react-native';

export function getEventImageSource(
  image: unknown,
  fallback: ImageSourcePropType,
): ImageSourcePropType {
  if (typeof image !== 'string') {
    return fallback;
  }

  const normalizedImage = image.trim();

  if (!normalizedImage) {
    return fallback;
  }

  if (
    normalizedImage.startsWith('http://') ||
    normalizedImage.startsWith('https://') ||
    normalizedImage.startsWith('data:image/')
  ) {
    return { uri: normalizedImage };
  }

  return fallback;
}
