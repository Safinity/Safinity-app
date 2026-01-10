import React, { useRef, useEffect, useState } from 'react';
import { ScrollView, Dimensions, Platform, Alert } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';

import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { StaticMapPreview } from '../../components/maps/StaticMapPreview';
import { MapPin } from '../../components/maps/MapPin';
import { UserMarker } from '../../components/maps/UserMarker';
import { Colors, Spacing } from '../../constants/theme';
import mapData from '../../data/mapdata.json';
import { latLngToPixelFromBounds } from '../../utils/coordinates';

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
  showsHorizontalScrollIndicator: true,
  showsVerticalScrollIndicator: true,
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
`;

const PageHeader = styled.View`
  margin-bottom: ${Spacing.md}px;
  flex-direction: row;
  align-items: center;
  gap: ${Spacing.sm}px;
`;

const PageTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${Colors.white};
`;

const SosButton = styled.Pressable`
  position: absolute;
  bottom: ${Spacing.xxl}px;
  right: ${Spacing.margemLateral}px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${Colors.error};
  justify-content: center;
  align-items: center;
  z-index: 90;
`;

const SOSButtonText = styled.Text`
  color: ${Colors.white};
  font-size: 18px;
`;

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
  const [activeRoute, setActiveRoute] = useState<{ x: number; y: number }[] | null>(null);

  const { universityCoords, pins, bounds } = mapData;
  const tags = ['Exits', 'Friends', 'Stages', 'Food', 'Emergency'];

  useEffect(() => {
    // Center map on load
    const centerX = (IMAGE_WIDTH - screenWidth) / 2;
    const centerY = (IMAGE_HEIGHT - screenHeight) / 2;
    setTimeout(() => scrollRef.current?.scrollTo({ x: centerX, y: centerY, animated: false }), 50);
  }, []);

  const handlePinPress = (pin: (typeof pins)[number]) => {
    // Calculate pixel coordinates for route
    const start = latLngToPixelFromBounds(
      CURRENT_LOCATION.lat,
      CURRENT_LOCATION.lng,
      bounds,
      IMAGE_WIDTH,
      IMAGE_HEIGHT,
    );
    const end = latLngToPixelFromBounds(pin.lat, pin.lng, bounds, IMAGE_WIDTH, IMAGE_HEIGHT);

    // Simple straight-line route for demonstration
    const route = [start, end].map(p => ({ x: p.x, y: p.y + USER_HEIGHT / 2 }));
    setActiveRoute(route);
  };

  // Filter pins based on selected tags
  const visiblePins =
    selectedTags.length === 0
      ? pins
      : pins.filter(pin => selectedTags.some(tag => TAG_TO_PIN_TYPE[tag]?.includes(pin.type)));

  return (
    <Container>
      <MapScrollView ref={scrollRef}>
        {/* Static Map */}
        <StaticMapPreview center={universityCoords} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} />

        {/* Route Polyline */}
        <Svg width={IMAGE_WIDTH} height={IMAGE_HEIGHT} style={{ position: 'absolute' }}>
          {activeRoute && (
            <Polyline
              points={activeRoute.map(p => `${p.x},${p.y}`).join(' ')}
              stroke={Colors.primary}
              strokeWidth={4}
              fill="none"
            />
          )}
        </Svg>

        {/* Render filtered pins */}
        {visiblePins.map(pin => (
          <MapPin
            key={pin.id}
            pin={pin}
            bounds={bounds}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            onPress={handlePinPress}
          />
        ))}

        {/* User location */}
        <UserMarker
          location={CURRENT_LOCATION}
          bounds={bounds}
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
        />
      </MapScrollView>

      <Header onNotificationPress={() => {}} onProfilePress={() => {}} />

      <OverlayContent>
        <PageHeader>
          <Ionicons name="location" size={28} color={Colors.primary} />
          <PageTitle>Universidade de Aveiro</PageTitle>
        </PageHeader>

        <SearchInput
          variant="mapa"
          placeholder="Search locations or points of interest..."
          value={searchValue}
          onChangeText={setSearchValue}
        />

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

      <SosButton onPress={() => Alert.alert('SOS', 'Emergency services notified')}>
        <SOSButtonText>SOS</SOSButtonText>
      </SosButton>
    </Container>
  );
}
