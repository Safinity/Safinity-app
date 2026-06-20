import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Dimensions } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Polyline,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useAuth } from '@clerk/expo'; 

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
import api, { API_BASE } from '../../utils/api';
import { latLngToPixelFromBounds } from '../../utils/coordinates';
import { getUserImageSource } from '../../utils/userImages';
import { useThemePreference } from '@/context/ThemeContext';
import Head from 'expo-router/head';

type MapPinItem = {
  id: string | number;
  name: string;
  type: string;
  lat: number;
  lng: number;
  friendId?: string | null;
  point_interest_id?: string | null;
  image?: string | null;
};

type GeoPoint = {
  lat: number;
  lng: number;
};

type MapStageItem = {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  rotation: number;
  width?: number;
  height?: number;
};

type LoadedMapPayload = {
  event?: { id?: string; name?: string | null };
  map?: {
    center?: { lat: number; lng: number };
    zoom?: number;
    bounds?: { north: number; south: number; west: number; east: number };
    currentLocation?: GeoPoint;
    pins?: MapPinItem[];
    stages?: MapStageItem[];
  };
};

type DensitySensor = {
  id: string | number;
  event_id?: string | number | null;
  sensor_type?: string | null;
  density?: number | null;
  last_reading_time?: string | null;
  lat: number;
  lng: number;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const IMAGE_WIDTH = screenWidth * 2.5;
const IMAGE_HEIGHT = screenHeight * 1.6;

const MIN_SCALE = 0.7;
const MAX_SCALE = 3;

// Atualizado para usar as cores semânticas injetadas pelo Styled Provider
const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MapViewport = styled.View`
  flex: 1;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background};
`;

const OverlayContent = styled.View`
  position: absolute;
  top: 70px;
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

const HeatmapToggle = styled.Pressable<{ active: boolean; currentTheme: 'light' | 'dark' }>`
  align-self: flex-start;
  margin-left: ${Spacing.margemLateral}px;
  margin-top: ${Spacing.md}px;
  padding: 10px 14px;
  border-radius: 22px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  background-color: ${({ active, currentTheme }) => {
    if (active) return Colors.primary;
    return currentTheme === 'dark' ? Colors.grayNavbar : 'white';
  }};
`;

const HeatmapToggleText = styled.Text<{ active: boolean; currentTheme: 'light' | 'dark' }>`
  font-size: 13px;
  font-weight: light;
  color: ${({ active, currentTheme }) => {
    if (active) return Colors.white;
    return currentTheme === 'dark' ? Colors.white : '#1C1C1E';
  }};
`;

const HeatmapLegend = styled.View.attrs<{ currentTheme: 'light' | 'dark' }>(props => ({
  shadowOffset: { width: 0, height: 2 },
}))<{ currentTheme: 'light' | 'dark' }>`
  position: absolute;
  left: ${Spacing.margemLateral}px;
  bottom: ${Spacing.xxl}px;
  z-index: 950;
  height: 90px;
  padding: 6px 7px;
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  background-color: ${({ currentTheme }) => 
    currentTheme === 'dark' ? 'rgba(20, 24, 34, 0.85)' : 'rgba(255, 255, 255, 0.92)'
  };
  
  elevation: ${({ currentTheme }) => currentTheme === 'dark' ? 0 : 3};
  shadow-color: #000000;
  shadow-opacity: ${({ currentTheme }) => currentTheme === 'dark' ? 0 : 0.1};
  shadow-radius: 4px;
`;

const HeatmapLegendBar = styled.View`
  width: 8px;
  height: 75px;
  border-radius: 5px;
  overflow: hidden;
`;

const HeatmapLegendLabels = styled.View`
  height: 75px;
  flex-direction: column;
  justify-content: space-between;
`;

const HeatmapLegendLabel = styled.Text<{ currentTheme: 'light' | 'dark' }>`
  font-family: ${({ theme }) => theme?.text?.label?.fontFamily || 'System'};
  font-size: ${({ theme }) => theme?.text?.label?.fontSize || 12}px;
  line-height: ${({ theme }) => theme?.text?.label?.lineHeight || 14}px;
  font-weight: 500;
  color: ${({ currentTheme }) => currentTheme === 'dark' ? Colors.white : '#1C1C1E'};
  opacity: 0.82;
`;

const NavigationFooter = styled.View`
  position: absolute;
  bottom: ${Spacing.xxl}px;
  left: ${Spacing.margemLateral}px;
  right: 100px;
  z-index: 1000;
`;

const LongCancelButton = styled.Pressable`
  background-color: ${({ theme }) => theme.colors.background};
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
  color: #ed7979;
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
  Medical: ['medical'],
  Points: ['point'],
};

const getDisplayName = (item: { name?: string }) => {
  return item.name || 'Unnamed Item';
};

const HEAT_GREEN = { r: 15, g: 214, b: 191 };
const HEAT_ORANGE = { r: 255, g: 152, b: 42 };
const HEAT_RED = { r: 200, g: 50, b: 50 };

const getHeatColor = (density?: number | null, alpha = 1) => {
  const densityRatio = Math.max(0, Math.min(100, Number(density ?? 0))) / 100;
  const startColor = densityRatio <= 0.5 ? HEAT_GREEN : HEAT_ORANGE;
  const endColor = densityRatio <= 0.5 ? HEAT_ORANGE : HEAT_RED;
  const segmentRatio = densityRatio <= 0.5 ? densityRatio * 2 : (densityRatio - 0.5) * 2;
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * segmentRatio);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * segmentRatio);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * segmentRatio);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getHeatSize = (density?: number | null) => {
  const value = Math.max(0, Math.min(100, Number(density ?? 0)));
  return 135 + value * 1.55;
};

const getHeatOpacity = (density?: number | null) => {
  const value = Math.max(0, Math.min(100, Number(density ?? 0)));
  return 0.13 + (value / 100) * 0.32;
};

const matchesSearch = (item: { name?: string; type?: string }, query: string) => {
  if (!query) return true;
  const q = query.toLowerCase();
  const name = getDisplayName(item).toLowerCase();
  return name.includes(q) || (item.type || '').toLowerCase().includes(q);
};

const getRouteParam = (value?: string | string[]) => {
  return Array.isArray(value) ? value[0] : value;
};

const TopFadeImage = styled.Image`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 399px;
  z-index: 40;
`;

export default function MapScreen() {
  const theme = useTheme();
  const { themeMode } = useThemePreference();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const getTokenRef = useRef(getToken);

  // Sincronização robusta através do teu Context customizado global
  const currentTheme = themeMode === 'dark' ? 'dark' : 'light';

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [activeRoute, setActiveRoute] = useState<{ x: number; y: number }[] | null>(null);
  const [destinationName, setDestinationName] = useState('');
  const [mapPayload, setMapPayload] = useState<LoadedMapPayload | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [densitySensors, setDensitySensors] = useState<DensitySensor[]>([]);
  const [realUserLocation, setRealUserLocation] = useState<GeoPoint | null>(null);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const mapSource = mapPayload?.map;
  
  // Incluído &t= para rebentar a cache da imagem nativa aquando da mutação do tema
  const mapImageUrl = mapPayload?.event?.id
    ? `${API_BASE}/events/${mapPayload.event.id}/static-map?theme=${currentTheme}&width=1024&height=1024&t=${currentTheme}`
    : undefined;

  const pins = useMemo(() => mapSource?.pins ?? [], [mapSource?.pins]);
  const stages = useMemo(() => mapSource?.stages ?? [], [mapSource?.stages]);
  const bounds = mapSource?.bounds ?? mapData.bounds;
  const currentLocation = realUserLocation;
  const tags = ['Exits', 'Friends', 'Stages', 'Food', 'WC', 'Medical', 'Entrance', 'Points'];
  const { focusId, eventId } = useLocalSearchParams<{ focusId?: string; eventId?: string }>();
  const requestedEventId = getRouteParam(eventId);

  const clampMapTranslation = useCallback(() => {
    'worklet';

    const scaledWidth = IMAGE_WIDTH * scale.value;
    const scaledHeight = IMAGE_HEIGHT * scale.value;
    const minX = screenWidth - (IMAGE_WIDTH + scaledWidth) / 2;
    const maxX = (scaledWidth - IMAGE_WIDTH) / 2;
    const minY = screenHeight - (IMAGE_HEIGHT + scaledHeight) / 2;
    const maxY = (scaledHeight - IMAGE_HEIGHT) / 2;

    translateX.value = Math.min(maxX, Math.max(minX, translateX.value));
    translateY.value = Math.min(maxY, Math.max(minY, translateY.value));
  }, [scale, translateX, translateY]);

  const getClampedMapTranslation = useCallback(
    (targetX: number, targetY: number) => {
      const scaledWidth = IMAGE_WIDTH * scale.value;
      const scaledHeight = IMAGE_HEIGHT * scale.value;
      const minX = screenWidth - (IMAGE_WIDTH + scaledWidth) / 2;
      const maxX = (scaledWidth - IMAGE_WIDTH) / 2;
      const minY = screenHeight - (IMAGE_HEIGHT + scaledHeight) / 2;
      const maxY = (scaledHeight - IMAGE_HEIGHT) / 2;

      return {
        x: Math.min(maxX, Math.max(minX, targetX)),
        y: Math.min(maxY, Math.max(minY, targetY)),
      };
    },
    [scale],
  );

  useEffect(() => {
    let mounted = true;

    const loadMap = async () => {
      if (!isSignedIn) {
        if (mounted) {
          setMapLoading(false);
          setMapError('Please sign in to view the event map.');
        }
        return;
      }

      try {
        setMapLoading(true);
        setMapError(null);

        const token = await getTokenRef.current();

        if (!token) {
          throw new Error('Could not retrieve a valid session token from Clerk.');
        }

        const requestConfig = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        let targetEventId = requestedEventId;

        if (!targetEventId) {
          const presentEventResponse = await api.get('/events/present-event', requestConfig);
          const presentEvent = presentEventResponse.data;
          targetEventId = presentEvent?.id ? String(presentEvent.id) : undefined;
        }

        if (!targetEventId) {
          if (mounted) {
            setMapPayload(null);
            setMapError('No active event found for the current user');
          }
          return;
        }

        const mapUrl = `/events/${targetEventId}/mapa`;
        const mapResponse = await api.get(mapUrl, requestConfig);

        if (mounted) {
          setMapPayload(mapResponse.data);
        }
      } catch (error: any) {
        if (mounted) {
          setMapPayload(null);
          setMapError(error?.response?.data?.message || 'Unable to load event map');
        }
      } finally {
        if (mounted) {
          setMapLoading(false);
        }
      }
    };

    loadMap();

    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn, requestedEventId]);

  useEffect(() => {
    let mounted = true;
    let subscription: Location.LocationSubscription | null = null;

    const persistLocation = async (location: GeoPoint) => {
      if (!isSignedIn) {
        return;
      }

      try {
        const token = await getTokenRef.current();
        if (!token) return;

        await api.patch('/users/me/location', location, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error: any) {}
    };

    const loadRealLocation = async () => {
      if (!isLoaded || !isSignedIn) {
        setRealUserLocation(null);
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        if (mounted) {
          setRealUserLocation(null);
        }
        return;
      }

      const initialPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const initialLocation = {
        lat: initialPosition.coords.latitude,
        lng: initialPosition.coords.longitude,
      };

      if (mounted) {
        setRealUserLocation(initialLocation);
      }
      persistLocation(initialLocation);

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10_000,
          distanceInterval: 5,
        },
        position => {
          const nextLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (mounted) {
            setRealUserLocation(nextLocation);
          }
          persistLocation(nextLocation);
        },
      );
    };

    loadRealLocation().catch(() => {
      if (mounted) {
        setRealUserLocation(null);
      }
    });

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const loadSensors = async () => {
      if (!isLoaded || !isSignedIn || !mapPayload?.event?.id) {
        return;
      }

      try {
        const token = await getTokenRef.current();
        const response = await api.get(`/events/${mapPayload.event.id}/sensors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sensors = Array.isArray(response.data) ? response.data : [];

        if (mounted) {
          setDensitySensors(
            sensors.filter(
              (sensor: DensitySensor) =>
                typeof sensor.lat === 'number' && typeof sensor.lng === 'number',
            ),
          );
        }
      } catch (error: any) {}
    };

    loadSensors();
    intervalId = setInterval(loadSensors, 10_000);

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoaded, isSignedIn, mapPayload?.event?.id]);

  const panGesture = Gesture.Pan().onChange(e => {
    translateX.value += e.changeX;
    translateY.value += e.changeY;
    clampMapTranslation();
  });

  const pinchGesture = Gesture.Pinch().onChange(e => {
    const newScale = scale.value * e.scaleChange;
    scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
    clampMapTranslation();
  });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handlePinPress = useCallback(
    (pin: any, showRoute = false) => {
      if (pin.lat === undefined || pin.lng === undefined || !bounds) {
        return;
      }

      const pos = latLngToPixelFromBounds(pin.lat, pin.lng, bounds, IMAGE_WIDTH, IMAGE_HEIGHT);

      setSelectedPin({
        ...pin,
        name: getDisplayName(pin),
        px: pos.x,
        py: pos.y,
      });

      const targetTranslation = getClampedMapTranslation(
        screenWidth / 2 - (IMAGE_WIDTH / 2 + (pos.x - IMAGE_WIDTH / 2) * scale.value),
        screenHeight / 2 - (IMAGE_HEIGHT / 2 + (pos.y - IMAGE_HEIGHT / 2) * scale.value),
      );

      translateX.value = withTiming(targetTranslation.x);
      translateY.value = withTiming(targetTranslation.y);

      if (showRoute) {
        if (!currentLocation) {
          setSelectedPin(null);
          return;
        }

        const start = latLngToPixelFromBounds(
          currentLocation.lat,
          currentLocation.lng,
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
    [bounds, currentLocation, getClampedMapTranslation, scale, translateX, translateY],
  );

  const handleCancelRoute = () => {
    setActiveRoute(null);
    setDestinationName('');
  };

  const visiblePins: MapPinItem[] =
    selectedTags.length === 0
      ? pins.filter((pin: MapPinItem) => matchesSearch(pin, searchValue))
      : pins.filter(
          (pin: MapPinItem) =>
            selectedTags.some(tag => TAG_TO_PIN_TYPE[tag]?.includes(pin.type)) &&
            matchesSearch(pin, searchValue),
        );

  const visibleStages: MapStageItem[] =
    selectedTags.length === 0 || selectedTags.includes('Stages')
      ? stages.filter((stage: MapStageItem) => matchesSearch(stage, searchValue))
      : [];

  useEffect(() => {
    if (focusId) {
      const targetPin = pins.find((p: MapPinItem) => p.friendId === focusId);
      if (targetPin) {
        const timer = setTimeout(() => handlePinPress(targetPin, true), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [focusId, pins, handlePinPress]);

  return (
    <Container>
      <Head>
        <title>Map | Safinity</title>
      </Head>
      <Stack.Screen options={{ title: 'Map | Safinity', headerShown: false }} />

      <GestureDetector gesture={composedGesture}>
        <MapViewport>
          <Animated.View style={[{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }, animatedStyle]} accessible={false}>
            <StaticMapPreview
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              theme={currentTheme}  
              imageUrl={mapImageUrl}
            />

            <Svg width={IMAGE_WIDTH} height={IMAGE_HEIGHT} style={{ position: 'absolute' }} pointerEvents="none">
              {heatmapEnabled && (
                <>
                  <Defs>
                    {densitySensors.map(sensor => {
                      const alpha = getHeatOpacity(sensor.density);
                      const gradientId = `heat-${String(sensor.id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;

                      return (
                        <RadialGradient key={gradientId} id={gradientId} cx="50%" cy="50%" r="50%">
                          <Stop offset="0%" stopColor={getHeatColor(sensor.density, alpha)} stopOpacity={0.3} />
                          <Stop offset="36%" stopColor={getHeatColor(sensor.density, alpha * 0.68)} stopOpacity={0.15} />
                          <Stop offset="68%" stopColor={getHeatColor(sensor.density, alpha * 0.32)} stopOpacity={0.1} />
                          <Stop offset="100%" stopColor={getHeatColor(sensor.density, 0)} stopOpacity={0} />
                        </RadialGradient>
                      );
                    })}
                  </Defs>

                  {densitySensors.map(sensor => {
                    const { x, y } = latLngToPixelFromBounds(sensor.lat, sensor.lng, bounds, IMAGE_WIDTH, IMAGE_HEIGHT);
                    const gradientId = `heat-${String(sensor.id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;

                    return (
                      <Circle
                        key={`circle-${gradientId}`}
                        cx={x}
                        cy={y}
                        r={getHeatSize(sensor.density)}
                        fill={`url(#${gradientId})`}
                      />
                    );
                  })}
                </>
              )}

              {activeRoute && (
                <Polyline
                  points={activeRoute.map(p => `${p.x},${p.y}`).join(' ')}
                  stroke={Colors.primary}
                  strokeWidth={4}
                  fill="none"
                  strokeDasharray="10,5"
                />
              )}
            </Svg>

            {visiblePins.map(pin => {
              if (pin.lat === null || pin.lng === null || pin.lat === undefined) return null;
              return (
                <MapPin
                  key={String(pin.id)}
                  pin={pin}
                  avatar={pin.type === 'friend' ? (getUserImageSource(pin.image) ?? undefined) : undefined}
                  bounds={bounds}
                  width={IMAGE_WIDTH}
                  height={IMAGE_HEIGHT}
                  onPress={() => handlePinPress(pin)}
                  accessible
                  role="button"
                  accessibilityLabel={`Map pin: ${getDisplayName(pin)} (${pin.type})`}
                />
              );
            })}

            {visibleStages.map(stage => {
              if (stage.lat === null || stage.lng === null || stage.lat === undefined) return null;
              return (
                <MapStage
                  key={String(stage.id)}
                  stage={stage}
                  bounds={bounds}
                  width={IMAGE_WIDTH}
                  height={IMAGE_HEIGHT}
                  onPress={() => handlePinPress(stage)}
                  accessible
                  role="button"
                  accessibilityLabel={`Stage: ${getDisplayName(stage)}`}
                />
              );
            })}

            {selectedPin && (
              <MapCallout
                x={selectedPin.px}
                y={selectedPin.py}
                title={selectedPin.name}
                onPressRoute={() => handlePinPress(selectedPin, true)}
              />
            )}

            {currentLocation && (
              <UserMarker location={currentLocation} bounds={bounds} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} />
            )}
          </Animated.View>
        </MapViewport>
      </GestureDetector>

      <TopFadeImage
        source={require('../../assets/images/degrade-mapa.png')}
        resizeMode="stretch"
        pointerEvents="none"
      />

      <Header />

      <OverlayContent pointerEvents="box-none">
        <PageHeader>
          <Ionicons name="location" size={28} color={Colors.palette.primary.light50} />
          <PageTitle accessibilityRole="header">
            {mapPayload?.event?.name ?? 'University of Aveiro'}
          </PageTitle>
        </PageHeader>

        {mapError && !mapLoading && (
          <PaddingSearchInput>
            <DestinationText style={{ color: Colors.error }}>{mapError}</DestinationText>
          </PaddingSearchInput>
        )}

        <PaddingSearchInput>
          <SearchInput variant="mapa" placeholder="Search..." value={searchValue} onChangeText={setSearchValue} />
        </PaddingSearchInput>

        <FilterTags
          tags={tags}
          selectedTags={selectedTags}
          onTagPress={tag =>
            setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
          }
          variant="mapa"
          style={{ marginTop: Spacing.md }}
        />

        <HeatmapToggle
          active={heatmapEnabled}
          currentTheme={currentTheme}
          onPress={() => setHeatmapEnabled(prev => !prev)}
          accessible
          role="button"
          accessibilityLabel={heatmapEnabled ? 'Disable heatmap filter' : 'Enable heatmap filter'}
        >
          <Ionicons 
            name="flame" 
            size={16} 
            color={heatmapEnabled ? Colors.white : (currentTheme === 'dark' ? Colors.white : '#1C1C1E')} 
          />
          <HeatmapToggleText active={heatmapEnabled} currentTheme={currentTheme}>
            Heatmap
          </HeatmapToggleText>
        </HeatmapToggle>
      </OverlayContent>

      {heatmapEnabled && (
        <HeatmapLegend currentTheme={currentTheme} pointerEvents="none">
          <HeatmapLegendBar>
            <Svg width={8} height={75}>
              <Defs>
                <LinearGradient id="heatmap-legend-gradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={getHeatColor(100, 1)} />
                  <Stop offset="50%" stopColor={getHeatColor(50, 1)} />
                  <Stop offset="100%" stopColor={getHeatColor(0, 1)} />
                </LinearGradient>
              </Defs>
              <Rect width={8} height={75} rx={4} fill="url(#heatmap-legend-gradient)" />
            </Svg>
          </HeatmapLegendBar>
          <HeatmapLegendLabels>
            <HeatmapLegendLabel currentTheme={currentTheme}>High</HeatmapLegendLabel>
            <HeatmapLegendLabel currentTheme={currentTheme}>Low</HeatmapLegendLabel>
          </HeatmapLegendLabels>
        </HeatmapLegend>
      )}

      {activeRoute && (
        <NavigationFooter accessibilityLabel={`Active navigation route to ${destinationName}`}>
          <LongCancelButton
            onPress={handleCancelRoute}
            accessible
            role="button"
            accessibilityLabel={`Cancel route to ${destinationName}`}
          >
            <Ionicons name="close-circle" size={20} color="#ed7979" />
            <CancelText>Cancel Route</CancelText>
            <DestinationText>| {destinationName}</DestinationText>
          </LongCancelButton>
        </NavigationFooter>
      )}

      <SosButton onPress={() => router.push('/sos')} accessible role="button" accessibilityLabel="Emergency SOS button">
        <SOSButtonText>SOS</SOSButtonText>
      </SosButton>
    </Container>
  );
}