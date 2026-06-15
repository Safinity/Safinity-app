import React, { useState, useEffect, useCallback } from 'react';
import { Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Polyline } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router, Stack } from 'expo-router';

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
import api from '../../utils/api';
import { latLngToPixelFromBounds } from '../../utils/coordinates';
import Head from 'expo-router/head';

type MapPinItem = {
  id: string | number;
  name: string;
  type: string;
  lat: number;
  lng: number;
  friendId?: string | null;
  point_interest_id?: string | null;
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
    currentLocation?: { lat: number; lng: number };
    pins?: MapPinItem[];
    stages?: MapStageItem[];
  };
};

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
};
const getDisplayName = (item: { name?: string }) => {
  return item.name || 'Unnamed Item';
};
const matchesSearch = (item: { name?: string; type?: string }, query: string) => {
  if (!query) return true;
  const q = query.toLowerCase();
  const name = getDisplayName(item).toLowerCase();
  return name.includes(q) || (item.type || '').toLowerCase().includes(q);
};

// --- MapScreen Component ---
export default function MapScreen() {
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

  const mapSource = mapPayload?.map;
  const universityCoords = mapSource?.center ?? mapData.universityCoords;
  const pins = mapSource?.pins ?? mapData.pins;
  const stages = mapSource?.stages ?? mapData.stages;
  const bounds = mapSource?.bounds ?? mapData.bounds;
  const tags = ['Exits', 'Friends', 'Stages', 'Food', 'Entrance'];
  const { focusId } = useLocalSearchParams();

  // Log para monitorizar o estado das variáveis críticas de renderização a cada ciclo
  console.log('[MAP_DEBUG] Component Render State:', {
    hasPayload: !!mapPayload,
    pinsCount: pins?.length ?? 0,
    stagesCount: stages?.length ?? 0,
    mapLoading,
    hasError: !!mapError,
  });

  useEffect(() => {
    let mounted = true;

    const loadMap = async () => {
      try {
        console.log('[MAP_DEBUG] Iniciando o carregamento dos dados do mapa...');
        setMapLoading(true);
        setMapError(null);

        console.log('[MAP_DEBUG] Fazendo chamada para /events/present-event...');
        const presentEventResponse = await api.get('/events/present-event');
        const presentEvent = presentEventResponse.data;
        console.log('[MAP_DEBUG] Resposta de present-event:', presentEvent);

        if (!presentEvent?.id) {
          console.warn(
            '[MAP_DEBUG] Nenhum evento ativo (presentEvent.id) foi retornado pelo backend.',
          );
          if (mounted) {
            setMapPayload(null);
            setMapError('No active event found for the current user');
          }
          return;
        }

        // Alterado para /map para sincronizar com as rotas padrão do NestJS
        const mapUrl = `/events/${presentEvent.id}/mapa`;
        console.log(`[MAP_DEBUG] Buscando a infraestrutura do mapa no endpoint: ${mapUrl}`);
        const mapResponse = await api.get(mapUrl);

        console.log(
          '[MAP_DEBUG] Resposta do mapa com sucesso. Estrutura das chaves:',
          Object.keys(mapResponse.data || {}),
        );
        if (mapResponse.data?.map) {
          console.log('[MAP_DEBUG] Detalhes do mapa recebido:', {
            center: mapResponse.data.map.center,
            pinsReceived: mapResponse.data.map.pins?.length ?? 0,
            stagesReceived: mapResponse.data.map.stages?.length ?? 0,
            bounds: mapResponse.data.map.bounds,
          });
        }

        if (mounted) {
          setMapPayload(mapResponse.data);
        }
      } catch (error: any) {
        console.error('[MAP_DEBUG] Erro crítico capturado no bloco loadMap:', {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
        });
        if (mounted) {
          setMapPayload(null);
          setMapError('Unable to load event map');
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
  }, []);

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
      console.log('[MAP_DEBUG] Pino pressionado:', {
        id: pin.id,
        name: pin.name,
        lat: pin.lat,
        lng: pin.lng,
        showRoute,
      });

      if (pin.lat === undefined || pin.lng === undefined || !bounds) {
        console.error('[MAP_DEBUG] Impossível calcular projeção: lat, lng ou bounds indefinidos.', {
          pin,
          bounds,
        });
        return;
      }

      const pos = latLngToPixelFromBounds(pin.lat, pin.lng, bounds, IMAGE_WIDTH, IMAGE_HEIGHT);
      console.log('[MAP_DEBUG] Coordenadas convertidas para píxeis locais:', pos);

      setSelectedPin({
        ...pin,
        name: getDisplayName(pin),
        px: pos.x,
        py: pos.y,
      });

      // Centraliza o mapa no pin
      translateX.value = withTiming(screenWidth / 2 - pos.x * scale.value);
      translateY.value = withTiming(screenHeight / 2 - pos.y * scale.value);

      if (showRoute) {
        console.log('[MAP_DEBUG] Calculando rota até o destino solicitado...');
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
    [bounds, scale, translateX, translateY],
  );

  const handleCancelRoute = () => {
    console.log('[MAP_DEBUG] Rota cancelada pelo utilizador.');
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
      console.log(
        `[MAP_DEBUG] focusId detetado via URL params: ${focusId}. Procurando pino do amigo...`,
      );
      const targetPin = pins.find((p: MapPinItem) => p.friendId === focusId);
      if (targetPin) {
        console.log('[MAP_DEBUG] Amigo encontrado! Disparando centralização automática em 300ms.');
        const timer = setTimeout(() => handlePinPress(targetPin, true), 300);
        return () => clearTimeout(timer);
      } else {
        console.warn(
          `[MAP_DEBUG] focusId ${focusId} ativo, mas não corresponde a nenhum pino na lista.`,
        );
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
        <Animated.View
          style={[{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }, animatedStyle]}
          accessible={false}
        >
          <StaticMapPreview
            center={universityCoords}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            zoom={mapSource?.zoom}
            theme="dark"
          />

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
                strokeDasharray="10,5"
              />
            )}
          </Svg>

          {visiblePins.map(pin => {
            // Log de salvaguarda caso o banco devolva coordenadas corrompidas para este pino
            if (pin.lat === null || pin.lng === null || pin.lat === undefined) {
              console.warn(
                `[MAP_DEBUG] Omitindo renderização do pino ${pin.id} (${pin.name}) devido a coordenadas nulas.`,
              );
              return null;
            }
            return (
              <MapPin
                key={String(pin.id)}
                pin={pin}
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
            if (stage.lat === null || stage.lng === null || stage.lat === undefined) {
              return null;
            }
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

          <UserMarker
            location={mapSource?.currentLocation ?? CURRENT_LOCATION}
            bounds={bounds}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
          />
        </Animated.View>
      </GestureDetector>

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
          style={{ marginTop: Spacing.md }}
        />
      </OverlayContent>

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

      <SosButton
        onPress={() => router.push('/sos')}
        accessible
        role="button"
        accessibilityLabel="Emergency SOS button"
      >
        <SOSButtonText>SOS</SOSButtonText>
      </SosButton>
    </Container>
  );
}
