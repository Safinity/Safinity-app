import React from 'react';
import { Image } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// 1. Importação do mapeamento para resolver o erro 404
import { calendarImages } from '../assets/images/Calendar/index';

const CardContainer = styled.TouchableOpacity`
  height: 180px;
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
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
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
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
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: 12px;
  font-weight: 400;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
`;

const TitleText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  font-size: 18px;
  font-weight: bold;
  margin-top: 4px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
`;

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

  return (
    <CardContainer activeOpacity={0.8} onPress={handlePress}>
      <StyledImage source={getImageSource()} resizeMode="cover" />

      <Overlay colors={['rgba(0,0,0,0.1)', 'transparent', 'rgba(0,0,0,0.9)']}>
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
