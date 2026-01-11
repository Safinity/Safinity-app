import React, { useRef, useEffect, useState } from 'react';
import { ScrollView, Dimensions, Platform, Alert, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';

import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { StaticMapPreview } from '../../components/maps/StaticMapPreview';
import { MapPin } from '../../components/maps/MapPin';
import { UserMarker } from '../../components/maps/UserMarker';
import { MapCallout } from '../../components/maps/MapCallout';
import { Colors, Spacing } from '../../constants/theme';
import mapData from '../../data/mapdata.json';
import { latLngToPixelFromBounds } from '../../utils/coordinates';
import { MapThemeToggle } from '../../components/maps/MapThemeToggle';
import { MapStage } from '../../components/maps/MapStage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const IMAGE_WIDTH = screenWidth * 2.5;
const IMAGE_HEIGHT = screenHeight * 1.6;
const CURRENT_LOCATION = { lat: 40.63021152549589, lng: -8.656757232421452 };

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const MapScrollView = styled.ScrollView.attrs({
  horizontal: true,
  maximumZoomScale: 1.5,
  minimumZoomScale: 0.3,
  showsHorizontalScrollIndicator: false,
  showsVerticalScrollIndicator: false,
  pinchGestureEnabled: true,
  contentContainerStyle: { width: IMAGE_WIDTH, height: IMAGE_HEIGHT },
})`
  flex: 1;
`;

const OverlayContent = styled.View`
  position: absolute;
  top: ${Platform.OS === 'ios' ? 90 : 70}px;
  left: 0;
  right: 0;
  z-index: 100;
  padding-top: 20px;
`;

const PaddingSearchInput = styled.View`
  padding: 0 ${Spacing.margemLateral}px;
`;

const PageHeader = styled.View`
  margin-bottom: ${Spacing.sm}px;
  flex-direction: row;
  align-items: center;
  gap: ${Spacing.sm}px;
  padding-left: ${Spacing.xl}px;
`;

const PageTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${Colors.white};
`;

const SosButton = styled.Pressable<{ $isNavigating: boolean }>`
  position: absolute;
  /* Moves up if the navigation bar is visible */
  bottom: ${Spacing.xxl}px;
  right: ${Spacing.margemLateral}px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${Colors.error};
  justify-content: center;
  align-items: center;
  z-index: 90;
  elevation: 5;
  shadow-opacity: 0.3;
  shadow-offset: 0px 0px;
  shadow-color: ${Colors.white};
  shadow-radius: 10px;
`;

const SOSButtonText = styled.Text`
  color: ${Colors.white};
  font-size: 18px;
  font-weight: bold;
`;

const NavigationFooter = styled.View`
  position: absolute;
  /* Moved up to 50px to stay well above the device nav bar */
  bottom: ${Spacing.xxl}px;
  left: ${Spacing.margemLateral}px;
  right: 100px;
  z-index: 1000;
`;

const LongCancelButton = styled.Pressable`
  background-color: ${Colors.background};
  height: 50px;
  border-radius: 30px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 20px;
  elevation: 10;

  shadow-opacity: 0.3;
  shadow-offset: 0px 4px;
`;

const CancelText = styled.Text`
  color: ${Colors.error};
  font-size: 16px;
  font-weight: bold;
`;

const DestinationText = styled.Text`
  color: #aaaaaa;
  font-size: 14px;
`;

// --- Logic ---

const TAG_TO_PIN_TYPE: Record<string, string[]> = {
  Friends: ['friend'],
  Food: ['food'],
  WC: ['wc'],
  Exits: ['exit'],
  Stages: ['stage'],
  Emergency: ['emergency'],
};

export default function MapScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mapTheme, setMapTheme] = useState<'light' | 'dark'>('dark');

  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [activeRoute, setActiveRoute] = useState<{ x: number; y: number }[] | null>(null);
  const [destinationName, setDestinationName] = useState('');

  const { universityCoords, pins, stages, bounds } = mapData;
  const tags = ['Exits', 'Friends', 'Stages', 'Food', 'Emergency'];

  useEffect(() => {
    const centerX = (IMAGE_WIDTH - screenWidth) / 2;
    const centerY = (IMAGE_HEIGHT - screenHeight) / 2;
    setTimeout(() => scrollRef.current?.scrollTo({ x: centerX, y: centerY, animated: false }), 50);
  }, []);

  const toggleTheme = () => setMapTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const handlePinPress = (pin: any) => {
    const pos = latLngToPixelFromBounds(pin.lat, pin.lng, bounds, IMAGE_WIDTH, IMAGE_HEIGHT);
    setSelectedPin({ ...pin, px: pos.x, py: pos.y });

    scrollRef.current?.scrollTo({
      x: pos.x - screenWidth / 2,
      y: pos.y - screenHeight / 2,
      animated: true,
    });
  };

  const handleShowRoute = () => {
    if (!selectedPin) return;
    setDestinationName(selectedPin.name || 'Destino');

    const start = latLngToPixelFromBounds(
      CURRENT_LOCATION.lat,
      CURRENT_LOCATION.lng,
      bounds,
      IMAGE_WIDTH,
      IMAGE_HEIGHT,
    );
    const end = { x: selectedPin.px, y: selectedPin.py };

    setActiveRoute([start, end]);
    setSelectedPin(null);
  };

  const handleCancelRoute = () => {
    setActiveRoute(null);
    setDestinationName('');
  };

  const visiblePins =
    selectedTags.length === 0
      ? pins
      : pins.filter(pin => selectedTags.some(tag => TAG_TO_PIN_TYPE[tag]?.includes(pin.type)));

  return (
    <Container>
      <MapScrollView ref={scrollRef}>
        {/* Layer 1: The Map */}

        <Pressable
          onPress={() => {
            setSelectedPin(null);
          }}
        >
          <StaticMapPreview
            center={universityCoords}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            theme={mapTheme}
          />
        </Pressable>
        {/* Layer 2: The Route Path */}
        <Svg
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
          style={{ position: 'absolute' }}
          pointerEvents="none"
        >
          {activeRoute && (
            <Polyline
              points={activeRoute.map(p => `${p.x},${p.y}`).join(' ')}
              stroke={Colors.primary}
              strokeWidth={4}
              fill="none"
              strokeDasharray="10, 5"
            />
          )}
        </Svg>

        {/* Layer 3: Pins (Rendered first) */}
        {visiblePins.map(pin => (
          <MapPin
            key={pin.id}
            pin={pin}
            bounds={bounds}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            onPress={() => handlePinPress(pin)}
          />
        ))}

        {/* Layer 4: Stages (Rendered on top of pins for better clickability) */}
        {stages.map(stage => (
          <MapStage
            key={stage.id}
            stage={stage}
            bounds={bounds}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            onPress={() => handlePinPress(stage)}
          />
        ))}

        {/* Layer 5: Callout Bubble */}
        {selectedPin && (
          <MapCallout
            x={selectedPin.px}
            y={selectedPin.py}
            title={selectedPin.name}
            onPressRoute={handleShowRoute}
          />
        )}

        <UserMarker
          location={CURRENT_LOCATION}
          bounds={bounds}
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
        />
      </MapScrollView>

      {/* UI Overlays */}
      <Header onNotificationPress={() => {}} onProfilePress={() => {}} />

      <OverlayContent pointerEvents="box-none">
        <PageHeader>
          <MapThemeToggle theme={mapTheme} onToggle={toggleTheme} />
          <Ionicons name="location" size={28} color={Colors.primary} />
          <PageTitle>Universidade de Aveiro</PageTitle>
        </PageHeader>
        <PaddingSearchInput>
          <SearchInput
            variant="mapa"
            placeholder="Pesquisar..."
            value={searchValue}
            onChangeText={setSearchValue}
          />
        </PaddingSearchInput>
        <FilterTags
          tags={tags}
          selectedTags={selectedTags}
          onTagPress={tag =>
            setSelectedTags(prev =>
              prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
            )
          }
          variant="mapa"
          style={{ marginTop: Spacing.md }}
        />
      </OverlayContent>

      {/* Navigation Mode Footer */}
      {activeRoute && (
        <NavigationFooter>
          <LongCancelButton onPress={handleCancelRoute}>
            <Ionicons name="close-circle" size={20} color={Colors.error} />
            <CancelText>Cancel Route</CancelText>
            <DestinationText>| {destinationName}</DestinationText>
          </LongCancelButton>
        </NavigationFooter>
      )}

      <SosButton onPress={() => Alert.alert('SOS', 'Emergency services notified')}>
        <SOSButtonText>SOS</SOSButtonText>
      </SosButton>
    </Container>
  );
}
