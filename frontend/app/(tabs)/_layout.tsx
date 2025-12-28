import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

const NavbarBackground = styled.View`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  height: 73px;
  margin-horizontal: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => 
    Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.md}px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 12px;
  elevation: 8;
`;

const TabItemContainer = styled.View`
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const IconWrapper = styled.View`
  align-items: center;
  justify-content: center;
  height: 24px;
`;

const TabLabel = styled.Text<{ $focused: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  margin-top: 2px;
  color: ${({ $focused, theme }) => 
    $focused ? theme.colors.white : theme.colors.gray};
`;
// ========== FIM STYLED COMPONENTS ==========

const tabConfigs = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'map', title: 'Map', icon: 'map' },
  { name: 'calendar', title: 'Calendar', icon: 'calendar' },
  { name: 'friends', title: 'Friends', icon: 'people' },
] as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 73,
          position: 'absolute',
          marginHorizontal: 16,
          marginBottom: Platform.OS === 'ios' ? 20 : 16,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 0,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarBackground: () => <NavbarBackground />,
        tabBarItemStyle: {
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}>

      {tabConfigs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <IconWrapper>
                <Ionicons
                  name={focused ? tab.icon : `${tab.icon}-outline`}
                  size={22}
                  color={color}
                />
              </IconWrapper>
            ),
            tabBarLabel: ({ focused, children }) => (
              <TabLabel $focused={focused}>
                {children}
              </TabLabel>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}