import React, { useState } from 'react';
import styled from 'styled-components';
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
/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

type PinType = 'food' | 'wc' | 'exit' | 'entrance';

/** EXACT shape of JSON pins */
interface RawPin {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string;
}

/** Safe, app-level pin */
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

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */

const isPinType = (type: string): type is PinType =>
  type === 'food' || type === 'wc' || type === 'exit' || type === 'entrance';

/* ------------------------------------------------------------------ */

const MAP_SIZE = 1000;

const ManageEventPage: React.FC = () => {
  const { universityCoords, pins, stages, bounds } = mapData;

  const [selectedItem, setSelectedItem] = useState<
    ((Pin | Stage) & { px: number; py: number }) | null
  >(null);

  /* ✅ SAFELY CONVERT RAW JSON → STRONG TYPES */
  const filteredPins: Pin[] = (pins as RawPin[])
    .filter(pin => isPinType(pin.type))
    .map(pin => ({
      ...pin,
      type: pin.type as PinType,
    }));

  const handleItemClick = (item: Pin | Stage) => {
    const pos = latLngToPixelFromBounds(item.lat, item.lng, bounds, MAP_SIZE, MAP_SIZE);

    setSelectedItem({
      ...item,
      px: pos.x,
      py: pos.y,
    });
  };

  return (
    <Layout>
      <MainContent>
        <HeaderSection>
          <Title>Web Summit</Title>
          <Subtitle>Manage event</Subtitle>
        </HeaderSection>

        <DashboardGrid>
          {/* MAP */}
          <SectionContainer>
            <SectionLabel>Map</SectionLabel>

            <MapViewport>
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
                      />
                    ))}

                    {selectedItem && (
                      <MapCallout
                        x={selectedItem.px}
                        y={selectedItem.py}
                        title={selectedItem.name}
                      />
                    )}
                  </MapCanvas>
                </TransformComponent>
              </TransformWrapper>
            </MapViewport>
          </SectionContainer>

          {/* CAMERAS */}
          <CamerasColumn>
            <SectionContainer>
              <SectionLabel>Cameras - video</SectionLabel>
              <CameraImage src={camerawebsummit} alt="Camera feed" />
            </SectionContainer>

            <SectionContainer>
              <SectionLabel>Cameras - AI-powered analysis</SectionLabel>
              <CameraImage src={aicaamerawebsummit} alt="AI Camera feed" />
            </SectionContainer>
          </CamerasColumn>
        </DashboardGrid>
      </MainContent>
    </Layout>
  );
};

export default ManageEventPage;

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */

const Layout = styled.div`
  background-color: ${theme.colors.background};
  min-height: 100vh;
  color: ${theme.colors.white};
  font-family: ${theme.fonts.family};
  margin-left: 150px;
  margin-right: 150px;
`;

const MainContent = styled.div`
  padding: ${theme.spacing.xl}px ${theme.spacing.margemLateral}px;
`;

const HeaderSection = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: ${theme.fonts.weights.bold};
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: ${theme.fonts.sizes.lg}px;
  color: ${theme.colors.neutralGray};
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
  height: 600px;
  background-color: #1a1d24;
  border-radius: ${theme.borderRadius.xlarge}px;
  overflow: hidden;
  border: 1px solid ${theme.colors.grayNavbar};
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
`;
