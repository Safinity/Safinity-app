import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ScrollView, Dimensions, Platform, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';

// --- Imports for Association ---
import users from '@/data/users.json';
import { userImages } from '../../assets/images/Users/userImages';

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
import { MapStage } from '../../components/maps/MapStage';
import { router, useLocalSearchParams } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const IMAGE_WIDTH = screenWidth * 2.5;
const IMAGE_HEIGHT = screenHeight * 1.6;
const CURRENT_LOCATION = mapData.currentLocation;

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const MapScrollView = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  showsVerticalScrollIndicator: false,
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

  ${Platform.OS === 'web' &&
  `
    pointer-events: none;
  `}
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

  ${Platform.OS === 'web' &&
  `
    pointer-events: auto;
  `}
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

const TAG_TO_PIN_TYPE: Record<string, string[]> = {
  Friends: ['friend'],
  Food: ['food'],
  WC: ['wc'],
  Exits: ['exit'],
  Stages: ['stage'],
  Entrance: ['entrance'],
};

const getDisplayName = (item: any) => {
  if (item.type === 'friend' && item.friendId) {
    const user = users.find(u => u.id === item.friendId);
    return user ? user.name : item.name;
  }
  return item.name;
};

const matchesSearch = (item: any, query: string) => {
  if (!query) return true;
  const q = query.toLowerCase();
  const name = getDisplayName(item).toLowerCase();
  return name.includes(q) || item.type?.toLowerCase().includes(q);
};

export default function MapScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const zoomScaleRef = useRef(1);

  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [activeRoute, setActiveRoute] = useState<{ x: number; y: number }[] | null>(null);
  const [destinationName, setDestinationName] = useState('');

  const { universityCoords, pins, stages, bounds } = mapData;
  const tags = ['Exits', 'Friends', 'Stages', 'Food', 'Entrance'];

  useEffect(() => {
    const centerX = (IMAGE_WIDTH - screenWidth) / 2;
    const centerY = (IMAGE_HEIGHT - screenHeight) / 2;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: centerX, y: centerY, animated: false });
    }, 50);
  }, []);

  const handlePinPress = useCallback(
    (pin: any) => {
      const pos = latLngToPixelFromBounds(pin.lat, pin.lng, bounds, IMAGE_WIDTH, IMAGE_HEIGHT);
      const scale = zoomScaleRef.current;

      setSelectedPin({ ...pin, name: getDisplayName(pin), px: pos.x, py: pos.y });

      scrollRef.current?.scrollTo({
        x: pos.x * scale - screenWidth / 2,
        y: pos.y * scale - screenHeight / 2,
        animated: true,
      });
    },
    [bounds],
  );

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
      ? pins.filter(pin => matchesSearch(pin, searchValue))
      : pins.filter(
          pin =>
            selectedTags.some(tag => TAG_TO_PIN_TYPE[tag]?.includes(pin.type)) &&
            matchesSearch(pin, searchValue),
        );

  const visibleStages =
    selectedTags.length === 0 || selectedTags.includes('Stages')
      ? stages.filter(stage => matchesSearch(stage, searchValue))
      : [];

  const { focusId } = useLocalSearchParams();

  useEffect(() => {
    if (focusId && pins) {
      const targetPin = pins.find(p => p.friendId === focusId);

      if (targetPin) {
        const timer = setTimeout(() => {
          handlePinPress(targetPin);
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [focusId, pins, handlePinPress]);

  return (
    <Container>
      {Platform.OS === 'web' ? (
        <div
          style={{
            width: '100vw',
            height: '100vh',
            overflow: 'auto', // BOTH horizontal and vertical
            position: 'relative',
            cursor: 'grab',
            minWidth: IMAGE_WIDTH,
            minHeight: IMAGE_HEIGHT,
          }}
        >
          <StaticMapPreview
            center={universityCoords}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            theme="dark"
          />

          <Svg
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            style={{ position: 'absolute', top: 0, left: 0 }}
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

          {visiblePins.map(pin => {
            const friendData =
              pin.type === 'friend' ? users.find(u => u.id === pin.friendId) : null;
            return (
              <MapPin
                key={pin.id}
                pin={pin}
                avatar={friendData ? userImages[friendData.image] : null}
                bounds={bounds}
                width={IMAGE_WIDTH}
                height={IMAGE_HEIGHT}
                onPress={() => handlePinPress(pin)}
              />
            );
          })}

          {visibleStages.map(stage => (
            <MapStage
              key={stage.id}
              stage={stage}
              bounds={bounds}
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              onPress={() => handlePinPress(stage)}
            />
          ))}

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
        </div>
      ) : (
        <MapScrollView
          ref={scrollRef}
          scrollEventThrottle={16}
          onScroll={e => {
            zoomScaleRef.current = e.nativeEvent.zoomScale ?? 1;
          }}
        >
          <Pressable onPress={() => setSelectedPin(null)}>
            <StaticMapPreview
              center={universityCoords}
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              theme="dark"
            />
          </Pressable>

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

          {visiblePins.map(pin => {
            const friendData =
              pin.type === 'friend' ? users.find(u => u.id === pin.friendId) : null;
            return (
              <MapPin
                key={pin.id}
                pin={pin}
                avatar={friendData ? userImages[friendData.image] : null}
                bounds={bounds}
                width={IMAGE_WIDTH}
                height={IMAGE_HEIGHT}
                onPress={() => handlePinPress(pin)}
              />
            );
          })}

          {visibleStages.map(stage => (
            <MapStage
              key={stage.id}
              stage={stage}
              bounds={bounds}
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              onPress={() => handlePinPress(stage)}
            />
          ))}

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
      )}

      <Header />

      <OverlayContent>
        <PageHeader>
          <Ionicons name="location" size={28} color={Colors.primary} />
          <PageTitle>University of Aveiro</PageTitle>
        </PageHeader>
        <PaddingSearchInput>
          <SearchInput
            variant="mapa"
            placeholder="Search..."
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
          style={{ marginTop: Spacing.md, pointerEvents: 'auto' }}
        />
      </OverlayContent>

      {activeRoute && (
        <NavigationFooter>
          <LongCancelButton onPress={handleCancelRoute}>
            <Ionicons name="close-circle" size={20} color={Colors.error} />
            <CancelText>Cancel Route</CancelText>
            <DestinationText>| {destinationName}</DestinationText>
          </LongCancelButton>
        </NavigationFooter>
      )}

      <SosButton onPress={() => router.push('/sos')}>
        <SOSButtonText>SOS</SOSButtonText>
      </SosButton>
    </Container>
  );
}
