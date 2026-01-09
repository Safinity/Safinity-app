export interface LatLng {
  lat: number;
  lng: number;
}

export interface Bounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

export interface Pixel {
  x: number;
  y: number;
}

/**
 * Convert latitude/longitude to pixel coordinates based on the bounding box
 * of the static map image
 */
export const latLngToPixelFromBounds = (
  lat: number,
  lng: number,
  bounds: Bounds,
  width: number,
  height: number,
): Pixel => {
  const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * width;
  const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * height;
  return { x, y };
};
