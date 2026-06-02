import React, { useState } from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { eventImages } from '../assets/images/Events';
import { calendarImages } from '../assets/images/Calendar';

const BannerContainer = styled.ImageBackground.attrs({
  resizeMode: 'cover',
})`
  width: 100%;
  height: ${({ theme }) => theme.height.xl}px;
  justify-content: flex-end;
`;

const HeroGradient = styled(LinearGradient).attrs(({ theme }) => ({
  colors: ['transparent', theme.colors.background],
  start: { x: 0, y: 0.2 },
  end: { x: 0, y: 1 },
}))`
  width: 100%;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.margemLateral}px;
  justify-content: flex-end;
`;

/* resto dos styled components mantidos como estavam */

export const HeroBanner = ({
  event,
  title,
  description,
  hideMap = false,
  isDetail = false,
}: any) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  // ⭐ MAPA ID → SLUG (igual ao EventCard)
  const eventIdToSlug: Record<string, string> = {
    '1': 'music-festival',
    '2': 'meo-mares-vivas-2025',
    '3': 'superbock-superrock-2025',
    '4': 'meo-sudoeste-2025',
  };

  const getSource = () => {
    if (!event) return null;

    // Se for calendário (usa calendarImages)
    if (calendarImages[event.image]) return calendarImages[event.image];

    // ⭐ Se for evento → usar slug
    const slug = eventIdToSlug[String(event.id)];
    if (slug && eventImages[slug]) return eventImages[slug];

    // Se vier URL externa (não é o caso, mas mantemos)
    if (typeof event.image === 'string' && event.image.startsWith('http')) {
      return { uri: event.image };
    }

    // fallback
    return eventImages['banner-lista-eventos'];
  };

  const imageSource = getSource();

  const isCalendar = isDetail && event?.title;
  const isEventDetail = isDetail && event?.name;
  const isList = !isDetail && title;
  const isHome = !isDetail && !title && event;

  const accessibleLabel = `Banner de destaque do evento: ${event?.name || event?.title || title || 'Evento'}`;

  return (
    <BannerContainer source={imageSource} accessible={false}>
      <HeroGradient
        accessible={true}
        accessibilityLabel={accessibleLabel}
        accessibilityRole="header"
        aria-label={accessibleLabel}
      >
        {/* resto do teu componente exatamente igual */}
      </HeroGradient>
    </BannerContainer>
  );
};
