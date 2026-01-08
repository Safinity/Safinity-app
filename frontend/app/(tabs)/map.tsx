import React, { useRef, useEffect, useState } from 'react';
import { ScrollView, Dimensions, Platform, Alert, Image } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';

import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { Colors, Spacing } from '../../constants/theme';
import { StaticMapPreview } from '../../components/maps/StaticMapPreview';
import mapData from '../data/mapdata.json'; // JSON with pins, bounds & universityCoords

/* -------------------------------------------------------------------------- */
/*                               CONFIGURATION                                */
/* -------------------------------------------------------------------------- */

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const IMAGE_WIDTH = screenWidth * 2.5;
const IMAGE_HEIGHT = screenHeight * 1.6;

// Mock user location
const CURRENT_LOCATION = { lat: 40.63021152549589, lng: -8.656757232421452 };

// Pin icons
const PIN_ICONS: Record<string, any> = {
  friend: require('../../assets/images/friend-pin.png'),
  food: require('../../assets/images/food-pin.png'),
  wc: require('../../assets/images/wc-pin.png'),
};

const USER_ICON = require('../../assets/images/user-location.png');

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

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
  padding: 0 ${Spacing.md}px;
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
  right: ${Spacing.xl}px;
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

/* -------------------------------------------------------------------------- */
/*                            COORDINATE PROJECTION                            */
/* -------------------------------------------------------------------------- */

/**
 * Convert latitude/longitude to pixel coordinates based on the bounding box
 * of the static map image
 */
const latLngToPixelFromBounds = (
  lat: number,
  lng: number,
  bounds: { north: number; south: number; west: number; east: number },
  width: number,
  height: number,
) => {
  const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * width;
  const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * height;
  return { x, y };
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export default function MapScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeRoute, setActiveRoute] = useState<{ x: number; y: number }[] | null>(null);

  const { universityCoords, pins, bounds } = mapData;
  const tags = ['Exits', 'Friends', 'Stages', 'Food', 'Emergency'];

  // Center map on load
  useEffect(() => {
    const centerX = (IMAGE_WIDTH - screenWidth) / 2;
    const centerY = (IMAGE_HEIGHT - screenHeight) / 2;
    setTimeout(() => scrollRef.current?.scrollTo({ x: centerX, y: centerY, animated: false }), 50);
  }, []);

  const handlePinPress = (pin: (typeof pins)[number]) => {
    const start = latLngToPixelFromBounds(
      CURRENT_LOCATION.lat,
      CURRENT_LOCATION.lng,
      bounds,
      IMAGE_WIDTH,
      IMAGE_HEIGHT,
    );
    const end = latLngToPixelFromBounds(pin.lat, pin.lng, bounds, IMAGE_WIDTH, IMAGE_HEIGHT);
    setActiveRoute([start, end]);
    Alert.alert('Route', `Showing route to ${pin.name}`);
  };

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
              stroke="#ac25ebff"
              strokeWidth={4}
              fill="none"
            />
          )}
        </Svg>

        {/* Render Pins */}
        {pins.map(pin => {
          const { x, y } = latLngToPixelFromBounds(
            pin.lat,
            pin.lng,
            bounds,
            IMAGE_WIDTH,
            IMAGE_HEIGHT,
          );
          return (
            <Image
              key={pin.id}
              source={PIN_ICONS[pin.type] || PIN_ICONS.friend}
              style={{
                position: 'absolute',
                width: 32,
                height: 42,
                left: x - 16,
                top: y - 42,
              }}
              onTouchEnd={() => handlePinPress(pin)}
            />
          );
        })}

        {/* User location */}
        {(() => {
          const { x, y } = latLngToPixelFromBounds(
            CURRENT_LOCATION.lat,
            CURRENT_LOCATION.lng,
            bounds,
            IMAGE_WIDTH,
            IMAGE_HEIGHT,
          );
          return (
            <Image
              source={USER_ICON}
              style={{
                position: 'absolute',
                width: 24,
                height: 36,
                left: x - 12,
                top: y - 36,
              }}
            />
          );
        })()}
      </MapScrollView>

      <Header onNotificationPress={() => {}} onProfilePress={() => {}} />

      <OverlayContent>
        <PageHeader>
          <Ionicons name="location" size={28} color={Colors.primary} />
          <PageTitle>Universidade de Aveiro</PageTitle>
        </PageHeader>

        <SearchInput
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
          color="rgba(48, 59, 73, 0.9)"
          selectedColor={Colors.primary}
          textColor={Colors.inactive}
          selectedTextColor={Colors.white}
        />
      </OverlayContent>

      <SosButton onPress={() => Alert.alert('SOS', 'Emergency services notified')}>
        <SOSButtonText>SOS</SOSButtonText>
      </SosButton>
    </Container>
  );
}
