import styled from 'styled-components';
import { getStaticMapUrl } from '../api/mapbox';

type Props = {
  center: { lat: number; lng: number };
  width: string | number; // Este width/height vem do MAP_SIZE (1024)
  height: string | number;
  theme: 'light' | 'dark';
  onPress?: () => void;
};

export function StaticMapPreview({ center, width, height, theme, onPress }: Props) {
  // 1. Garantimos que pedimos à API o mesmo tamanho que usamos nos cálculos dos Pins
  const mapUrl = getStaticMapUrl({
    center,
    width: 1024,
    height: 1024,
    theme,
  });

  return (
    <MapContainer onClick={onPress} style={{ width, height }}>
      <StyledImage src={mapUrl} alt="Map Preview" loading="lazy" />
    </MapContainer>
  );
}

const MapContainer = styled.div`
  cursor: pointer;
  /* Removido o border-radius daqui para não cortar os cantos dentro do zoom */
  position: relative;
  background-color: #1a1d24;
`;

const StyledImage = styled.img`
  /* 2. IMPORTANTE: Usamos 'fill' ou garantimos que a imagem ocupa os 1024px exatos */
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain; /* Mudado de cover para contain para evitar cortes de zoom */
`;
