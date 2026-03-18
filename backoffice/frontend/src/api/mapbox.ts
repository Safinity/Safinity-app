const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
export function getStaticMapUrl({
  center,
  zoom = 16.2,
  width = 1024,
  height = 1024,
  theme = 'dark',
}: {
  center: { lat: number; lng: number };
  zoom?: number;
  width?: number;
  height?: number;
  theme?: 'light' | 'dark';
}) {
  const style = theme === 'dark' ? 'mapbox/dark-v11' : 'mapbox/streets-v12';

  return (
    `https://api.mapbox.com/styles/v1/${style}/static/` +
    `${center.lng},${center.lat},${zoom}/${width}x${height}?access_token=${TOKEN}`
  );
}
