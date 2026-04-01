import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import mapData from '../data/mapdata.json';
import { latLngToPixelFromBounds } from '../components/maps/coordinates';
import { theme } from '../theme/theme';
import { StaticMapPreview } from '../components/StaticMapPreview';
import { MapPin } from '../components/maps/MapPin';
import { MapStage } from '../components/maps/MapStage';
import { MapCallout } from '../components/maps/MapCallout';
import camerawebsummit from '../assets/images/web-summit.png';
import aicaamerawebsummit from '../assets/images/Events/tech/web-summit.png';

type PinType = 'food' | 'wc' | 'exit' | 'entrance';
interface RawPin {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string;
}
interface Pin {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: PinType;
}
interface Stage {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  rotation?: number;
  width?: number;
  height?: number;
}

const isPinType = (type: string): type is PinType =>
  type === 'food' || type === 'wc' || type === 'exit' || type === 'entrance';

const MAP_SIZE = 1000;

const ManageEventPage: React.FC = () => {
  const { universityCoords, pins, stages, bounds } = mapData;
  const mapViewportRef = useRef<HTMLDivElement>(null);

  const [selectedItem, setSelectedItem] = useState<
    ((Pin | Stage) & { px: number; py: number }) | null
  >(null);
  const [mapFocused, setMapFocused] = useState(false);

  const filteredPins: Pin[] = (pins as RawPin[])
    .filter(pin => isPinType(pin.type))
    .map(pin => ({ ...pin, type: pin.type as PinType }));

  const handleItemClick = (item: Pin | Stage) => {
    const pos = latLngToPixelFromBounds(item.lat, item.lng, bounds, MAP_SIZE, MAP_SIZE);
    setSelectedItem({ ...item, px: pos.x, py: pos.y });
  };

  const handleMapKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!mapFocused) return;

    if (e.key === 'Enter') {
      // Focus first pin/stage
      const firstInteractive =
        mapViewportRef.current?.querySelector<HTMLElement>('[role="button"]');
      firstInteractive?.focus();
    }
  };

  const handlePinStageKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Press Esc to return focus to map container
    if (e.key === 'Escape') {
      mapViewportRef.current?.focus();
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Event | Safinity Backoffice</title>
      </Helmet>
      <MainContent>
        <HeaderSection>
          <Title tabIndex={0}>Manage Event</Title>
          <Subtitle tabIndex={0}>Web Summit 2025</Subtitle>
        </HeaderSection>

        <DashboardGrid>
          {/* MAP */}
          <SectionContainer>
            <SectionLabel id="map-section">Map</SectionLabel>

            <MapViewport
              role="region"
              aria-label="Event Map"
              tabIndex={0}
              ref={mapViewportRef}
              onFocus={() => setMapFocused(true)}
              onBlur={() => setMapFocused(false)}
              onKeyDown={handleMapKeyDown}
            >
              <TransformWrapper initialScale={1.2} minScale={0.5} maxScale={4} centerOnInit>
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                  <MapCanvas>
                    <StaticMapPreview
                      center={universityCoords}
                      width={MAP_SIZE}
                      height={MAP_SIZE}
                      theme="dark"
                    />

                    {filteredPins.map(pin => (
                      <MapPin
                        key={pin.id}
                        pin={pin}
                        bounds={bounds}
                        width={MAP_SIZE}
                        height={MAP_SIZE}
                        onPress={() => handleItemClick(pin)}
                        ariaLabel={`${pin.type} pin: ${pin.name}`}
                      />
                    ))}

                    {stages.map(stage => (
                      <MapStage
                        key={stage.id}
                        stage={stage}
                        bounds={bounds}
                        width={MAP_SIZE}
                        height={MAP_SIZE}
                        onPress={() => handleItemClick(stage)}
                        onKeyDown={handlePinStageKeyDown} // <-- handle Esc
                      />
                    ))}

                    {selectedItem && (
                      <MapCallout
                        x={selectedItem.px}
                        y={selectedItem.py}
                        title={selectedItem.name}
                        aria-live="polite"
                      />
                    )}
                  </MapCanvas>
                </TransformComponent>
              </TransformWrapper>
            </MapViewport>
          </SectionContainer>

          {/* Cameras */}
          <CamerasColumn>
            <SectionContainer>
              <SectionLabel>Cameras - video</SectionLabel>
              <CameraImage src={camerawebsummit} alt="Camera feed" tabIndex={0} />
            </SectionContainer>

            <SectionContainer>
              <SectionLabel>Cameras - AI-powered analysis</SectionLabel>
              <CameraImage src={aicaamerawebsummit} alt="AI Camera feed" tabIndex={0} />
            </SectionContainer>
          </CamerasColumn>
        </DashboardGrid>
      </MainContent>
    </>
  );
};

export default ManageEventPage;

/* --- STYLES --- */
const MainContent = styled.div`
  background-color: ${theme.colors.background};
  min-height: 100vh;
  color: ${theme.colors.white};
  font-family: ${theme.fonts.family};
  margin-left: 100px;
  margin-right: 100px;
  padding: ${theme.spacing.xl}px ${theme.spacing.margemLateral}px;
`;

const HeaderSection = styled.div`
  margin-bottom: 40px;
`;
const Title = styled.h1`
  font-size: ${theme.text.titulo.h1.fontSize};
  font-family: ${theme.text.titulo.h1.fontFamily};
  margin-bottom: 10px;
  color: ${theme.colors.white};
  outline: none;
  &:focus-visible {
    outline: 2px dashed ${theme.colors.primary};
    outline-offset: 2px;
  }
`;
const Subtitle = styled.h2`
  font-size: ${theme.text.titulo.h3.fontSize};
  font-family: ${theme.text.titulo.h3.fontFamily};
  color: ${theme.colors.primary_50};
  margin-top: 0;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: ${theme.spacing.xl}px;
`;
const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md}px;
`;
const SectionLabel = styled.label`
  font-size: 16px;
`;
const MapViewport = styled.div`
  height: 625px;
  width: 700px;
  background-color: #1a1d24;
  border-radius: ${theme.borderRadius.xlarge}px;
  overflow: hidden;
  border: 1px solid ${theme.colors.grayNavbar};
  outline: none;
`;
const MapCanvas = styled.div`
  position: relative;
  width: ${MAP_SIZE}px;
  height: ${MAP_SIZE}px;
`;
const CamerasColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl}px;
`;
const CameraImage = styled.img`
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.xlarge}px;
  &:focus-visible {
    outline: 3px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;
