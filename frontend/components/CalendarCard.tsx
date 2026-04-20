import React from 'react';
import { Image } from 'react-native';
import styled from 'styled-components/native';
import { Spacing, BorderRadius, Colors, TextStyles } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// 1. Importação do mapeamento para resolver o erro 404
import { calendarImages } from '../assets/images/Calendar/index';

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
  /* O transform scale(1.1) faz um zoom de 10%, eliminando as margens laterais 
     sem perder o centro da imagem */
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

const Badge = styled.Text`
  align-self: flex-end;
  color: ${Colors.white};
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 12px;
  overflow: hidden;
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

// Substitua o final do seu arquivo (o componente CalendarCard) por este:

export const CalendarCard = ({ item }: any) => {
  const router = useRouter();

  const handlePress = () => {
    if (item.id) {
      router.push(`/activity-details/${item.id}`);
    }
  };

  const getImageSource = () => {
    if (!item.image) return null;
    if (calendarImages[item.image]) {
      return calendarImages[item.image];
    }
    if (typeof item.image === 'string' && item.image.startsWith('http')) {
      return { uri: item.image };
    }
    return null;
  };

  // Texto descritivo para o Alt Text (Nome + Localização)
  const accessibleLabel = `Atividade: ${item.title} em ${item.location}. De ${item.startTime} até ${item.endTime}`;

  return (
    <CardContainer
      activeOpacity={0.8}
      onPress={handlePress}
      accessible={true}
      role="button"
      accessibilityLabel={`Abrir detalhes de: ${item.title}`}
      accessibilityHint="Navega para a descrição completa desta atividade do calendário"
    >
      <StyledImage
        source={getImageSource()}
        resizeMode="cover"
        accessible={false} // Esconde a imagem bruta para não duplicar a leitura
      />

      <Overlay
        colors={['rgba(0,0,0,0.1)', 'transparent', 'rgba(0,0,0,0.9)']}
        accessible={true}
        accessibilityLabel={accessibleLabel}
        // @ts-ignore
        aria-label={accessibleLabel}
      >
        <Badge>Click to view more</Badge>

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
