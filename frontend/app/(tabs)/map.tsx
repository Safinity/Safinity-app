import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/ui/header';
import { Platform, Dimensions } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const IMAGE_WIDTH = screenWidth * 6; 
const IMAGE_HEIGHT = screenHeight * 2; 

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const MainContent = styled.View`
  flex: 1;
  position: relative;
`;

// Container do mapa com cor escura (mesma cor de fundo)
const MapContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${Colors.background}; /* Mesma cor do container */
  overflow: hidden; /* Importante: esconde qualquer conteúdo fora dos limites */
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
  scrollEnabled: true,
  pinchGestureEnabled: true,
})`
  flex: 1;
`;

// Imagem do mapa
const MapImage = styled.Image.attrs({
  source: require('../../assets/images/map.png'),
})`
  width: ${IMAGE_WIDTH}px;
  height: ${IMAGE_HEIGHT}px;
  resize-mode: cover;
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
  margin-top: ${Spacing.md}px;
  margin-bottom: ${Spacing.md}px;
  flex-direction: row;
  align-items: center;
  align-content: center;
  gap: ${Spacing.sm}px;
`;

const PageTitle = styled.Text`
  font-size: 24px;
  margin-top: ${Spacing.xs}px;
  font-weight: bold;
  color: ${Colors.white};
  margin-bottom: ${Spacing.xs}px;
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
  const scrollViewRef = useRef(null);

  const tags = ['Exits', 'Friends', 'Stages', 'Food', 'Emergency'];

  useEffect(() => {
    // Posiciona no centro da imagem
    if (scrollViewRef.current) {
      // Calcula o centro da imagem
      const centerX = (IMAGE_WIDTH - screenWidth) / 2;
      const centerY = (IMAGE_HEIGHT - screenHeight) / 2;
      
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: centerX,
          y: centerY,
          animated: false,
        });
      }, 100);
    }
  }, []);

  const handleNotificationPress = () => {
  };

  const handleProfilePress = () => {
  };

  const handleSearchSubmit = () => {
  };

  const handleTagPress = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
    console.log('Tag selected:', tag);
  };

  const handleSOSPress = () => {
    alert('SOS activated! Emergency services have been notified.');
  };

  return (
    <Container>
      <MainContent>
        <MapContainer>
          <MapScrollView 
            ref={scrollViewRef}
            contentContainerStyle={{
              // Limites do scroll para não passar das bordas da imagem
              width: IMAGE_WIDTH,
              height: IMAGE_HEIGHT,
            }}
            // IMPORTANTE: Define os limites máximos do scroll
            maximumContentOffset={{
              x: IMAGE_WIDTH - screenWidth,
              y: IMAGE_HEIGHT - screenHeight,
            }}
            minimumContentOffset={{ x: 0, y: 0 }}
          >
            <MapImage />
          </MapScrollView>
        </MapContainer>

        <Header
          showTime={true}
          onNotificationPress={handleNotificationPress}
          onProfilePress={handleProfilePress}
        />

        <OverlayContent>
          <PageHeader>
            <Ionicons name="location" size={32} color={Colors.primary} />
            <PageTitle>Web Summit</PageTitle>
          </PageHeader>

          <SearchInput
            placeholder="Search locations or points of interest..."
            placeholderTextColor={Colors.inactive}
            value={searchValue}
            onChangeText={setSearchValue}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />

          <FilterTags
            tags={tags}
            selectedTags={selectedTags}
            onTagPress={handleTagPress}
            color="rgba(48, 59, 73, 0.9)"
            selectedColor={Colors.primary}
            textColor={Colors.inactive}
            selectedTextColor={Colors.white}
          />
        </OverlayContent>

        <SosButton onPress={handleSOSPress}>
          <SOSButtonText>SOS</SOSButtonText>
        </SosButton>
      </MainContent>
    </Container>
  );
}