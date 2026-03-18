// MapScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Polyline } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

import users from '@/data/users.json';
import { userImages } from '../../assets/images/Users/userImages';
import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { StaticMapPreview } from '../../components/maps/StaticMapPreview';
import { MapPin } from '../../components/maps/MapPin';
import { MapStage } from '../../components/maps/MapStage';
import { MapCallout } from '../../components/maps/MapCallout';
import { UserMarker } from '../../components/maps/UserMarker';
import { Colors, Spacing } from '../../constants/theme';
import mapData from '../../data/mapdata.json';
import { latLngToPixelFromBounds } from '../../utils/coordinates';
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const IMAGE_WIDTH = screenWidth * 2.5;
const IMAGE_HEIGHT = screenHeight * 1.6;
const CURRENT_LOCATION = mapData.currentLocation;

const MIN_SCALE = 0.7;
const MAX_SCALE = 3;

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

<<<<<<< HEAD
const MapScrollView = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  showsVerticalScrollIndicator: false,
  contentContainerStyle: { width: IMAGE_WIDTH, height: IMAGE_HEIGHT },
})`
  flex: 1;
`;

=======
>>>>>>> e9a52d37481d2341b00a3ceccfc8e7c9ad5e0e39
const OverlayContent = styled.View`
  position: absolute;
  top: 70px;
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
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [activeRoute, setActiveRoute] = useState<{ x: number; y: number }[] | null>(null);
  const [destinationName, setDestinationName] = useState('');

  const { universityCoords, pins, stages, bounds } = mapData;
  const tags = ['Exits', 'Friends', 'Stages', 'Food', 'Entrance'];

  const { focusId } = useLocalSearchParams();

  // --- GESTURES ---
  const panGesture = Gesture.Pan().onChange(e => {
    translateX.value += e.changeX;
    translateY.value += e.changeY;
  });

  const pinchGesture = Gesture.Pinch().onChange(e => {
    const newScale = scale.value * e.scaleChange;
    scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
  });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // --- FUNÇÕES ---
  const handlePinPress = useCallback(
    (pin: any, showRoute = false) => {
      const pos = latLngToPixelFromBounds(pin.lat, pin.lng, bounds, IMAGE_WIDTH, IMAGE_HEIGHT);

<<<<<<< HEAD
      setSelectedPin({ ...pin, name: getDisplayName(pin), px: pos.x, py: pos.y });

      scrollRef.current?.scrollTo({
        x: pos.x * scale - screenWidth / 2,
        y: pos.y * scale - screenHeight / 2,
        animated: true,
=======
      setSelectedPin({
        ...pin,
        name: getDisplayName(pin),
        px: pos.x,
        py: pos.y,
>>>>>>> e9a52d37481d2341b00a3ceccfc8e7c9ad5e0e39
      });

      // Centraliza o mapa no pin
      translateX.value = withTiming(screenWidth / 2 - pos.x * scale.value);
      translateY.value = withTiming(screenHeight / 2 - pos.y * scale.value);

      if (showRoute) {
        const start = latLngToPixelFromBounds(
          CURRENT_LOCATION.lat,
          CURRENT_LOCATION.lng,
          bounds,
          IMAGE_WIDTH,
          IMAGE_HEIGHT,
        );
        const end = { x: pos.x, y: pos.y };
        setActiveRoute([start, end]);
        setDestinationName(getDisplayName(pin));
        setSelectedPin(null);
      }
    },
    [bounds],
  );

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

  // --- FOCO AUTOMÁTICO NO AMIGO ---
  useEffect(() => {
<<<<<<< HEAD
    if (focusId && pins) {
=======
    if (focusId) {
>>>>>>> e9a52d37481d2341b00a3ceccfc8e7c9ad5e0e39
      const targetPin = pins.find(p => p.friendId === focusId);
      if (targetPin) {
<<<<<<< HEAD
        const timer = setTimeout(() => {
          handlePinPress(targetPin);
        }, 300);

        return () => clearTimeout(timer);
=======
        setTimeout(() => handlePinPress(targetPin, true), 300);
>>>>>>> e9a52d37481d2341b00a3ceccfc8e7c9ad5e0e39
      }
    }
  }, [focusId, pins, handlePinPress]);

  return (
    <Container>
<<<<<<< HEAD
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
=======
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }, animatedStyle]}>
>>>>>>> e9a52d37481d2341b00a3ceccfc8e7c9ad5e0e39
          <StaticMapPreview
            center={universityCoords}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            theme="dark"
          />

          <Svg
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
<<<<<<< HEAD
            style={{ position: 'absolute', top: 0, left: 0 }}
=======
            style={{ position: 'absolute' }}
>>>>>>> e9a52d37481d2341b00a3ceccfc8e7c9ad5e0e39
            pointerEvents="none"
          >
            {activeRoute && (
              <Polyline
                points={activeRoute.map(p => `${p.x},${p.y}`).join(' ')}
                stroke={Colors.primary}
                strokeWidth={4}
                fill="none"
<<<<<<< HEAD
                strokeDasharray="10, 5"
=======
                strokeDasharray="10,5"
>>>>>>> e9a52d37481d2341b00a3ceccfc8e7c9ad5e0e39
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
<<<<<<< HEAD
              onPressRoute={handleShowRoute}
=======
              onPressRoute={() => handlePinPress(selectedPin, true)}
>>>>>>> e9a52d37481d2341b00a3ceccfc8e7c9ad5e0e39
            />
          )}

          <UserMarker
            location={CURRENT_LOCATION}
            bounds={bounds}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
          />
<<<<<<< HEAD
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
=======
        </Animated.View>
      </GestureDetector>
>>>>>>> e9a52d37481d2341b00a3ceccfc8e7c9ad5e0e39

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
