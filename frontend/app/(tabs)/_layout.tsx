import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useEventMode } from '@/context/EventModeContext';

const NavbarContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.navBackground};
  border-radius: ${({ theme }) => theme.borderRadius.xlarge}px;
  
  /* Diminui a altura fora do modo de evento se quiseres, ou mantém theme.height.md */
  height: ${({ $isEventMode, theme }) => 
    $isEventMode ? theme.height.md : theme.height.md * 0.95 }px; 
  
  margin-bottom: ${({ theme }) => theme.spacing.margemLateral}px;
  elevation: 8;
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 6px;
  shadow-opacity: 1;
  shadow-radius: 18px;
  position: absolute;
  bottom: 0;
  
  left: ${({ $isEventMode, theme }) => 
    $isEventMode ? theme.spacing.margemLateral  : theme.spacing.margemLateral * 1.3 }px;
  right: ${({ $isEventMode, theme }) => 
    $isEventMode ? theme.spacing.margemLateral  : theme.spacing.margemLateral * 1.3 }px;
`;

const TabBarContent = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

const TabButton = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const TabIcon = styled(Ionicons).attrs<{ $isEventMode: boolean }>(({ theme, $isEventMode }) => ({
  size: $isEventMode ? theme.height.xs : theme.height.xs * 0.9,
}))<{ $active: boolean; $isEventMode: boolean }>`
  color: ${({ $active, theme }) =>
    $active ? theme.colors.navActive : theme.colors.navInactive};
`;

const IconBox = styled.View`
  height: ${({ theme }) => theme.height.xs}px;
  margin-bottom: ${({ theme }) => theme.spacing.xxs}px;
  align-items: center;
  justify-content: center;
`;

const TabText = styled.Text<{ $active: boolean }>`
  ${({ theme }) => theme.text.textoPequeno};
  margin-top: ${({ theme }) => theme.spacing.xxs}px;
  color: ${({ $active, theme }) => ($active ? theme.colors.navActive : theme.colors.navInactive)};
`;

const eventModeTabs = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'map', title: 'Map', icon: 'map' },
  { name: 'calendar', title: 'Calendar', icon: 'calendar' },
  { name: 'friends', title: 'Friends', icon: 'people' },
] as const;

const outsideEventTabs = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'wallet', title: 'Wallet', icon: 'wallet' },
  { name: 'friends', title: 'Friends', icon: 'people' },
] as const;

const registeredScreens = [
  'index',
  'map',
  'calendar',
  'friends',
  'events-list',
  'wallet',
  'my-calendar',
  'notifications',
  'perfil/profile',
  'perfil/wallet',
  'perfil/ticket',
  'perfil/edit-profile',
  'perfil/security',
  'perfil/notifications-settings',
  'friends/[id]',
  'friends/friend-profile',
] as const;

function CustomTabBar({ state, navigation }: any) {
  const { isInEventMode } = useEventMode();
  const tabConfigs = isInEventMode ? eventModeTabs : outsideEventTabs;

  return (
    <NavbarContainer role="tablist" $isEventMode={isInEventMode}>
      <TabBarContent>
        {tabConfigs.map(tab => {
          const routeIndex = state.routes.findIndex((r: any) => r.name === tab.name);
          const isFocused = state.index === routeIndex;

          if (routeIndex === -1) return null;

          const onPress = () => {
            if (!isFocused) {
              navigation.navigate(tab.name);
            }
          };

          return (
            <TabButton
              key={tab.name}
              onPress={onPress}
              role="tab"
              accessibilityLabel={tab.title}
              accessibilityState={{ selected: isFocused }}
            >
              <IconBox>
                <TabIcon
                  name={isFocused ? tab.icon : `${tab.icon}-outline`}
                  $active={isFocused}
                  $isEventMode={isInEventMode} // 4. Passamos também para o ícone
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              </IconBox>

              <TabText $active={isFocused}>{tab.title}</TabText>
            </TabButton>
          );
        })}
      </TabBarContent>
    </NavbarContainer>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      {registeredScreens.map(name => (
        <Tabs.Screen key={name} name={name} />
      ))}
    </Tabs>
  );
}