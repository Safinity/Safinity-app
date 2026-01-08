import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Dimensions } from 'react-native';

import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';

import { Colors, Spacing } from '../../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const IMAGE_WIDTH = screenWidth * 6;
const IMAGE_HEIGHT = screenHeight * 2;

// Containers principais
const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const MainContent = styled.View`
  flex: 1;
  position: relative;
`;

const MapContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${Colors.background};
  overflow: hidden;
`;

const MapScrollView = styled.ScrollView.attrs({
  maximumZoomScale: 3,
  minimumZoomScale: 0.7,
  showsHorizontalScrollIndicator: false,
  showsVerticalScrollIndicator: false,
  bounces: false,
  bouncesZoom: false,
  overScrollMode: 'never',
  alwaysBounceHorizontal: false,
  alwaysBounceVertical: false,
  pinchGestureEnabled: true,
})`
  flex: 1;
`;

const MapImage = styled.Image.attrs({
  source: require('../../assets/images/map.png'),
})`
  width: ${IMAGE_WIDTH}px;
  height: ${IMAGE_HEIGHT}px;
  resize-mode: cover;
`;

// Overlay (header + search + tags)
const OverlayContent = styled.View`
  position: absolute;
  top: ${Platform.OS === 'ios' ? 90 : 70}px;
  left: 0;
  right: 0;
  z-index: 100;
`;

// Novo PaddedContent igual à HomePage
const PaddedContent = styled.View`
  padding: 0 ${Spacing.margemLateral}px;
`;

const PageHeader = styled.View`
  margin-top: ${Spacing.md}px;
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
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  z-index: 90;
`;

const SOSButtonText = styled.Text`
  color: ${Colors.white};
  font-size: 18px;
  letter-spacing: 1px;
`;

export default function MapScreen() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const scrollViewRef = useRef<any>(null);

  const tags = ['Exits', 'Friends', 'Stages', 'Food', 'Emergency'];

  useEffect(() => {
    if (scrollViewRef.current) {
      const centerX = (IMAGE_WIDTH - screenWidth) / 2;
      const centerY = (IMAGE_HEIGHT - screenHeight) / 2;

      setTimeout(() => {
        scrollViewRef.current.scrollTo({
          x: centerX,
          y: centerY,
          animated: false,
        });
      }, 100);
    }
  }, []);

  const handleTagPress = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const handleSOSPress = () => {
    alert('SOS activated! Emergency services have been notified.');
  };

  return (
    <Container>
      <MainContent>
        {/* MAPA */}
        <MapContainer>
          <MapScrollView
            ref={scrollViewRef}
            contentContainerStyle={{
              width: IMAGE_WIDTH,
              height: IMAGE_HEIGHT,
            }}
          >
            <MapImage />
          </MapScrollView>
        </MapContainer>

        {/* HEADER */}
        <Header showTime />

        {/* OVERLAY */}
        <OverlayContent>
          <PaddedContent>
            <PageHeader>
              <Ionicons name="location" size={32} color={Colors.primary} />
              <PageTitle>Web Summit</PageTitle>
            </PageHeader>

            <SearchInput value={searchValue} onChangeText={setSearchValue} variant="mapa" />
          </PaddedContent>
          <FilterTags
            tags={tags}
            selectedTags={selectedTags}
            onTagPress={handleTagPress}
            variant="mapa"
          />
        </OverlayContent>

        {/* SOS */}
        <SosButton onPress={handleSOSPress}>
          <SOSButtonText>SOS</SOSButtonText>
        </SosButton>
      </MainContent>
    </Container>
  );
}
