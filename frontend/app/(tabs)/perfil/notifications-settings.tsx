// app/perfil/notifications-settings.tsx
import React, { useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import Header from '../../../components/ui/header';
import Toggle from '../../../components/ui/toggle';
import { Colors, Spacing, Fonts } from '../../../constants/theme';

const NotificationSettingsScreen = () => {
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

  return (
    <Container>
      <Header variant="back" title="Notification Settings" showBottomDivider={false} />

      <Content>
        <Section>
          <Toggle
            isEnabled={notifications.allNotifications}
            onToggle={() => toggleNotification('allNotifications')}
            label="All Notifications"
            description="Enable or disable all notifications at once"
          />
        </Section>

        <Section>
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
      </Content>
    </Container>
  );
};

export default NotificationSettingsScreen;

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const Content = styled.View`
  padding: 0 ${Spacing.margemLateral}px;
  padding-top: ${Spacing.xxl}px;
  padding-bottom: ${Spacing.xl}px;
`;

const Section = styled.View`
  margin-bottom: ${Spacing.xl}px;
`;
