import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import Header from '../../../components/ui/header';
import Toggle from '../../../components/ui/toggle';
import { Spacing } from '../../../constants/theme';
import { useThemePreference } from '../../../context/ThemeContext';

const NotificationSettingsScreen = () => {
  const theme = useTheme();
  const { themeMode } = useThemePreference();

  const [notifications, setNotifications] = useState({
    allNotifications: true,
    waterReminders: true,
    crowdWarnings: true,
    calendarAlerts: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isDark = themeMode === 'dark';

  return (
    <Container>
      <Stack.Screen options={{ title: 'Notification Settings', headerShown: false }} />

      <Header
        variant="back"
        title="Notification Settings"
        showBottomDivider={false}
        colorScheme={isDark ? 'dark' : 'light'}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          {/* O ToggleWrapper força que todos os textos lá dentro obedeçam à cor correta */}
          <ToggleWrapper isDark={isDark}>
            <Section accessible={false} role="none">
              <Toggle
                isEnabled={notifications.allNotifications}
                onToggle={() => toggleNotification('allNotifications')}
                label="All Notifications"
                description="Enable or disable all notifications at once"
              />
            </Section>

            <Section accessible={false}>
              <Toggle
                isEnabled={notifications.waterReminders}
                onToggle={() => toggleNotification('waterReminders')}
                label="Water Reminders"
                description="Reminders to stay hydrated during events"
                disabled={!notifications.allNotifications}
              />

              <Toggle
                isEnabled={notifications.crowdWarnings}
                onToggle={() => toggleNotification('crowdWarnings')}
                label="Crowd Warnings"
                description="Alerts about crowded areas "
                disabled={!notifications.allNotifications}
              />

              <Toggle
                isEnabled={notifications.calendarAlerts}
                onToggle={() => toggleNotification('calendarAlerts')}
                label="Calendar Alerts"
                description="Notifications for activities on your saved events"
                disabled={!notifications.allNotifications}
              />
            </Section>
          </ToggleWrapper>
        </Content>
      </ScrollView>
    </Container>
  );
};

export default NotificationSettingsScreen;

// --- Styled Components ---

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Content = styled.View`
  padding: 0 ${Spacing.margemLateral}px;
  padding-top: ${Spacing.xxxl}px;
  padding-bottom: ${Spacing.xl}px;
`;

const Section = styled.View`
  margin-bottom: ${Spacing.xl}px;
`;

// Hack infalível: Seleciona qualquer componente de texto dentro do Toggle e injeta a cor correta por cima de qualquer estilo antigo
const ToggleWrapper = styled.View<{ isDark: boolean }>`
  && Text,
  && text,
  && * {
    color: ${({ isDark }) => (isDark ? '#FFFFFF' : '#222734')} !important;
  }

  /* Ajusta especificamente o texto secundário/descrição para não ficar tão escuro */
  && Text:nth-child(2),
  && Paragraph {
    color: ${({ isDark }) => (isDark ? '#b8b8be' : '#666666')} !important;
  }
`;
