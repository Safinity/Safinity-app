import React, { useState } from 'react';
import { Image, Platform, View } from 'react-native';
import styled from 'styled-components/native';
import { Spacing, BorderRadius, Colors, TextStyles } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { calendarImages } from '../assets/images/Calendar/index';

export const CalendarCard = ({ item }: any) => {
  const [isFavorite, setIsFavorite] = useState(item?.isFavorite ?? false);
  const router = useRouter();

  const handlePress = () => {
    if (item.id) {
      router.push(`/activity-details/${item.id}`);
    }
  };

  const handleToggleFavorite = (e: any) => {
    // Evita que o clique no coração também ative o clique do card inteiro (Bubbling/Propagation)
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    setIsFavorite((prev: boolean) => !prev);
  };

  const getImageSource = () => {
    if (!item.image) return null;

    if (typeof item.image === 'object' || typeof item.image === 'number') {
      return item.image;
    }
    if (calendarImages[item.image]) {
      return calendarImages[item.image];
    }
    if (typeof item.image === 'string' && item.image.startsWith('http')) {
      return { uri: item.image };
    }
    return null;
  };

  const accessibleLabel = `Atividade: ${item.title} em ${item.location}. De ${item.startTime} até ${item.endTime}`;

  return (
    <CardContainer
      activeOpacity={0.8}
      onPress={handlePress}
      accessible={true}
      // CORREÇÃO: Evita a conversão para a tag HTML <button> duplicada na Web, mantendo o comportamento nativo no mobile
      {...(Platform.OS === 'web' ? { as: View, onClick: handlePress, style: { cursor: 'pointer' } } : { role: 'button' })}
      accessibilityLabel={`Abrir detalhes de: ${item.title}`}
      accessibilityHint="Navega para a descrição completa desta atividade do calendário"
    >
      <StyledImage source={getImageSource()} resizeMode="cover" accessible={false} />

      <Overlay
        colors={['rgba(0,0,0,0.1)', 'transparent', 'rgba(0,0,0,0.9)']}
        accessible={true}
        accessibilityLabel={accessibleLabel}
        aria-label={accessibleLabel}
      >
        <TopRow>
          <FavoriteButton
            onPress={handleToggleFavorite}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? `Remover ${item.title} dos favoritos`
                : `Adicionar ${item.title} aos favoritos`
            }
            accessibilityHint="Marca ou desmarca esta atividade como favorita"
          >
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color="white" />
          </FavoriteButton>
        </TopRow>

        <InfoSection>
          <TimeText>
            {item.location} • {item.startTime} - {item.endTime}
          </TimeText>
          <TitleText numberOfLines={2}>{item.title}</TitleText>
        </InfoSection>
      </Overlay>
    </CardContainer>
  );
};

const CardContainer = styled.TouchableOpacity`
  height: 180px;
  width: 100%;
  border-radius: ${BorderRadius.large}px;
  overflow: hidden;
  margin-bottom: ${Spacing.md}px;
  background-color: #121417;
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: 100%;
  position: absolute;
  transform: scale(1.1);
`;

const Overlay = styled(LinearGradient)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  padding: 15px;
  justify-content: space-between;
`;

const InfoSection = styled.View`
  width: 100%;
`;

const TimeText = styled.Text`
  color: ${Colors.white};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: 12px;
  font-weight: 400;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
`;

const TitleText = styled.Text`
  color: ${Colors.white};
  font-family: ${TextStyles.titulo.h3.fontFamily};
  font-size: 18px;
  font-weight: bold;
  margin-top: 4px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
`;

const FavoriteButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: rgba(0, 0, 0, 0.45);
  justify-content: center;
  align-items: center;
`;

// CORREÇÃO: Mudado de 'end' para 'flex-end' para limpar o aviso de propriedades flex da consola Web
const TopRow = styled.View`
  width: 100%;
  align-items: flex-end;
`;